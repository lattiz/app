import 'reflect-metadata';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { PreviewCapabilityService } from '../../common/billing/preview-capability.service';
import { PreviewConfig } from '../../common/billing/preview.config';
import { ImageOptimizer } from '../../common/images/image-optimizer';
import { SettingsService } from '../../common/settings/settings.service';
import type { Database } from '../../database/database.module';
import type { ObjectStoragePort } from '../storage/domain/object-storage.port';
import { SanitizeHtmlSanitizer } from './sanitize-html.sanitizer';
import {
  AssetQuotaExceededException,
  UnsupportedAssetTypeException,
} from './sites.exceptions';
import { SitesService, type UploadedFile } from './sites.service';
import type { TemplateAccessService } from '../templates/template-access.service';

/** These tests are about the free preview; the template lock never applies. */
const unlockedTemplates = {
  assertNotLocked: () => Promise.resolve(),
} as unknown as TemplateAccessService;

const dialect = new PgDialect();
const DAY_MS = 86_400_000;
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);
const SVG = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"></svg>',
  'utf8',
);
const HTML = Buffer.from('<html><script>bad</script></html>', 'utf8');
const TMP = mkdtempSync(join(tmpdir(), 'lz-upload-test-'));

function sqlText(statement: SQL): string {
  return dialect.sqlToQuery(statement).sql;
}

interface Harness {
  sites: SitesService;
  uploads: () => string[];
  usageCalls: () => string[];
}

function serviceFor(
  entitled: boolean,
  env: Record<string, string>,
  usedBytes: number,
): Harness {
  const uploads: string[] = [];
  const usageCalls: string[] = [];
  const db = {
    execute: async (statement: SQL) => {
      const text = sqlText(statement);
      if (text.includes('SELECT 1 AS ok')) return [{ ok: 1 }];
      if (text.includes('FROM public.tenants')) {
        return [
          {
            plan: entitled ? 'basico' : 'none',
            preview_started_at: null,
            status: entitled ? 'active' : null,
            current_period_end: entitled
              ? new Date(Date.now() + 30 * DAY_MS)
              : null,
          },
        ];
      }
      return [];
    },
  } as unknown as Database;

  const storage = {
    uploadPublic: async (path: string) => {
      uploads.push(path);
      return `https://assets.example/${path}`;
    },
    removePublic: async () => undefined,
    publicUrl: (path: string) => path,
    pathFromPublicUrl: () => null,
    usageBytes: async (prefix: string) => {
      usageCalls.push(prefix);
      return usedBytes;
    },
  } as ObjectStoragePort;

  const configService = {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
  const preview = new PreviewCapabilityService(
    new PreviewConfig(
      configService,
      new SettingsService(configService, {
        loadAll: () => Promise.resolve(new Map()),
      }),
    ),
  );

  return {
    sites: new SitesService(
      db,
      storage,
      preview,
      new SanitizeHtmlSanitizer(),
      unlockedTemplates,
      new ImageOptimizer(),
    ),
    uploads: () => uploads,
    usageCalls: () => usageCalls,
  };
}

function file(
  mimetype: string,
  buffer: Buffer,
  originalname = 'photo.png',
): UploadedFile {
  const path = join(TMP, `${Math.random().toString(36).slice(2)}`);
  writeFileSync(path, buffer);
  return { originalname, mimetype, path, size: buffer.length };
}

describe('uploadAssets unpaid defenses', () => {
  it('rejects a mime outside the allowlist and a header that does not match', async () => {
    const harness = serviceFor(false, { PREVIEW_MAX_ASSET_BYTES: '100000' }, 0);
    await assert.rejects(
      () =>
        harness.sites.uploadAssets('tenant-1', 'user-1', [
          file('image/svg+xml', HTML, 'phish.svg'),
        ]),
      (error: unknown) => error instanceof UnsupportedAssetTypeException,
    );
    await assert.rejects(
      () =>
        harness.sites.uploadAssets('tenant-1', 'user-1', [
          file('image/png', HTML, 'phish.png'),
        ]),
      (error: unknown) => error instanceof UnsupportedAssetTypeException,
    );
    assert.deepEqual(harness.uploads(), []);
    assert.deepEqual(harness.usageCalls(), []);
  });

  it('stores a matching image under the tenant prefix and counts the batch once', async () => {
    const harness = serviceFor(
      false,
      { PREVIEW_MAX_ASSET_BYTES: '100000' },
      10,
    );
    await harness.sites.uploadAssets('tenant-1', 'user-1', [
      file('image/png', PNG, 'evil.html'),
      file('Image/PNG; charset=binary', PNG, 'also.html'),
    ]);
    assert.deepEqual(harness.usageCalls(), ['tenant-assets/tenant-1/']);
    assert.equal(harness.uploads().length, 2);
    assert.ok(harness.uploads().every((path) => /\.(png|webp)$/.test(path)));
    assert.ok(
      harness
        .uploads()
        .every((path) => path.startsWith('tenant-assets/tenant-1/')),
    );
  });

  it('rejects the batch when stored bytes plus the upload exceed the cap', async () => {
    const harness = serviceFor(false, { PREVIEW_MAX_ASSET_BYTES: '12' }, 10);
    await assert.rejects(
      () =>
        harness.sites.uploadAssets('tenant-1', 'user-1', [
          file('image/png', PNG),
        ]),
      (error: unknown) =>
        error instanceof AssetQuotaExceededException && error.status === 413,
    );
    assert.deepEqual(harness.uploads(), []);
    assert.deepEqual(harness.usageCalls(), ['tenant-assets/tenant-1/']);
  });

  it('skips mime, magic, and quota checks for an entitled tenant', async () => {
    const harness = serviceFor(true, { PREVIEW_MAX_ASSET_BYTES: '1' }, 999_999);
    await harness.sites.uploadAssets('tenant-1', 'user-1', [
      file('image/svg+xml', SVG, 'mark.svg'),
    ]);
    assert.deepEqual(harness.usageCalls(), []);
    assert.equal(harness.uploads().length, 1);
    assert.ok(harness.uploads()[0]?.endsWith('.svg'));
  });

  it('turns each unpaid defense off from config', async () => {
    const harness = serviceFor(
      false,
      { PREVIEW_ALLOWED_ASSET_MIME: '', PREVIEW_MAX_ASSET_BYTES: '0' },
      999_999,
    );
    await harness.sites.uploadAssets('tenant-1', 'user-1', [
      file('image/svg+xml', SVG, 'mark.svg'),
    ]);
    assert.deepEqual(harness.usageCalls(), []);
    assert.equal(harness.uploads().length, 1);
  });
});
