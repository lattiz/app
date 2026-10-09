import 'reflect-metadata';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { Database } from '../../database/database.module';
import type { ObjectStoragePort } from '../storage/domain/object-storage.port';
import { PreviewCapabilityService } from '../../common/billing/preview-capability.service';
import { PreviewConfig } from '../../common/billing/preview.config';
import { SettingsService } from '../../common/settings/settings.service';
import { SanitizeHtmlSanitizer } from './sanitize-html.sanitizer';
import { SitesService } from './sites.service';

const dialect = new PgDialect();
const DAY_MS = 86_400_000;

function sqlText(statement: SQL): string {
  return dialect.sqlToQuery(statement).sql;
}

function preview(env: Record<string, string> = {}): PreviewCapabilityService {
  const configService = {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
  const config = new PreviewConfig(
    configService,
    new SettingsService(configService, {
      loadAll: () => Promise.resolve(new Map()),
    }),
  );
  return new PreviewCapabilityService(config);
}

interface TenantFixture {
  plan: string;
  status: string | null;
  currentPeriodEnd: Date | null;
  previewStartedAt: Date | null;
}

function serviceFor(fixture: TenantFixture, env: Record<string, string> = {}) {
  let seals = 0;
  const stored: { project: string; html: string }[] = [];
  const db = {
    execute: async (statement: SQL) => {
      const text = sqlText(statement);
      if (text.includes('SELECT 1 AS ok')) return [{ ok: 1 }];
      if (text.includes('slug')) return [{ slug: 'demo', domain: null }];
      return [];
    },
    transaction: async (
      run: (tx: {
        execute: (statement: SQL) => Promise<unknown>;
      }) => Promise<unknown>,
    ) =>
      run({
        execute: async (statement: SQL) => {
          const text = sqlText(statement);
          if (text.includes('UPDATE public.site_schemas')) {
            const params = dialect.sqlToQuery(statement).params;
            stored.push({
              project: String(params[0]),
              html: String(params[1]),
            });
            return [{ published_at: new Date('2026-06-01T00:00:00.000Z') }];
          }
          if (text.includes('FROM public.tenants')) {
            return [
              {
                plan: fixture.plan,
                preview_started_at: fixture.previewStartedAt,
                status: fixture.status,
                current_period_end: fixture.currentPeriodEnd,
              },
            ];
          }
          if (text.includes('UPDATE public.tenants')) {
            assert.match(text, /preview_started_at IS NULL/);
            seals += 1;
            fixture.previewStartedAt = new Date('2026-06-01T00:00:00.000Z');
            return [];
          }
          return [];
        },
      }),
  } as unknown as Database;

  const storage = {
    uploadPublic: async () => '',
    removePublic: async () => undefined,
    publicUrl: () => '',
    pathFromPublicUrl: () => null,
    usageBytes: async () => 0,
  } as ObjectStoragePort;

  return {
    sites: new SitesService(
      db,
      storage,
      preview(env),
      new SanitizeHtmlSanitizer(),
    ),
    sealCount: () => seals,
    stored: () => stored,
  };
}

async function publish(
  sites: SitesService,
  exportedHtml = '<html></html>',
  project: Record<string, unknown> = { pages: [] },
): Promise<void> {
  await sites.publishSite('tenant-1', 'user-1', project, exportedHtml);
}

describe('publishSite preview stamp', () => {
  const previousUrl = process.env.TENANT_SITES_URL;
  const previousSecret = process.env.REVALIDATION_SECRET;

  beforeEach(() => {
    delete process.env.TENANT_SITES_URL;
    delete process.env.REVALIDATION_SECRET;
  });

  afterEach(() => {
    restore('TENANT_SITES_URL', previousUrl);
    restore('REVALIDATION_SECRET', previousSecret);
  });

  it('stamps a never-paid tenant once and leaves an entitled tenant alone', async () => {
    const trial = serviceFor({
      plan: 'none',
      status: null,
      currentPeriodEnd: null,
      previewStartedAt: null,
    });
    await publish(trial.sites);
    await publish(trial.sites);
    assert.equal(trial.sealCount(), 1);

    const entitled = serviceFor({
      plan: 'none',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * DAY_MS),
      previewStartedAt: null,
    });
    await publish(entitled.sites);
    assert.equal(entitled.sealCount(), 0);
  });

  it('does not stamp when the preview is switched off', async () => {
    const harness = serviceFor(
      {
        plan: 'none',
        status: null,
        currentPeriodEnd: null,
        previewStartedAt: null,
      },
      { PREVIEW_ENABLED: 'false' },
    );
    await publish(harness.sites);
    assert.equal(harness.sealCount(), 0);
  });

  it('does not stamp a lapsed basico or pro plan', async () => {
    const harness = serviceFor({
      plan: 'basico',
      status: 'canceled',
      currentPeriodEnd: new Date(Date.now() - DAY_MS),
      previewStartedAt: null,
    });
    await publish(harness.sites);
    assert.equal(harness.sealCount(), 0);
  });

  it('sanitizes unpaid html and leaves entitled or switched-off publishes untouched', async () => {
    const dirty = '<script>alert(1)</script><p>ok</p>';
    const unpaid = serviceFor({
      plan: 'none',
      status: null,
      currentPeriodEnd: null,
      previewStartedAt: null,
    });
    await publish(unpaid.sites, dirty);
    assert.equal(unpaid.stored()[0]?.html, '<p>ok</p>');

    const entitled = serviceFor({
      plan: 'none',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * DAY_MS),
      previewStartedAt: null,
    });
    await publish(entitled.sites, dirty);
    assert.equal(entitled.stored()[0]?.html, dirty);

    const switchedOff = serviceFor(
      {
        plan: 'none',
        status: null,
        currentPeriodEnd: null,
        previewStartedAt: null,
      },
      { PREVIEW_SANITIZE_ENABLED: 'false' },
    );
    await publish(switchedOff.sites, dirty);
    assert.equal(switchedOff.stored()[0]?.html, dirty);
  });
});

function restore(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}
