import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { PreviewConfig } from '../../../common/billing/preview.config';
import { SettingsService } from '../../../common/settings/settings.service';
import type { Database } from '../../../database/database.module';
import type { EmailOutboxService } from './email-outbox.service';
import { PreviewNotifierService } from './preview-notifier.service';

const dialect = new PgDialect();
const DAY_MS = 86_400_000;
const NOW = new Date('2026-06-15T12:00:00.000Z');

interface Fixture {
  id: string;
  name: string;
  email: string;
  emailConfirmedAt: Date | null;
  plan: string;
  previewStartedAt: Date | null;
  status: string | null;
  currentPeriodEnd: Date | null;
}

interface Enqueued {
  kind: string;
  to: string;
  data: Record<string, unknown>;
  idempotencyKey: string;
  tenantId: string | null;
}

function preview(env: Record<string, string> = {}): PreviewConfig {
  const config = {
    get: (key: string) => env[key],
  } as unknown as ConfigService;
  return new PreviewConfig(
    config,
    new SettingsService(config, {
      loadAll: () => Promise.resolve(new Map()),
    }),
  );
}

function daysBefore(days: number): Date {
  return new Date(NOW.getTime() - days * DAY_MS);
}

function isEntitled(row: Fixture, now: Date): boolean {
  if (!row.status || !row.currentPeriodEnd) return false;
  const valid = row.status === 'active' || row.status === 'trialing';
  return valid && row.currentPeriodEnd.getTime() > now.getTime();
}

function harness(
  fixtures: Fixture[],
  env: Record<string, string> = {},
  options: { preseededKeys?: string[] } = {},
) {
  const stored = new Map<string, Enqueued>();
  for (const key of options.preseededKeys ?? []) {
    stored.set(key, {
      kind: 'preview_ending',
      to: 'already@example.com',
      data: {},
      idempotencyKey: key,
      tenantId: null,
    });
  }
  const visibleToSelect = new Set<string>();
  let queries = 0;
  let releaseQuery: (() => void) | null = null;
  let holdQuery = false;

  const db = {
    execute: async (statement: SQL) => {
      queries += 1;
      if (holdQuery) {
        await new Promise<void>((resolve) => {
          releaseQuery = resolve;
        });
      }
      const query = dialect.sqlToQuery(statement);
      const text = query.sql;
      const now = new Date(String(query.params[0]));
      const warningDay = Number(query.params[1]);
      const trialDays = Number(query.params[3]);
      const batch = Number(query.params[5]);
      const matched = fixtures
        .filter((row) => {
          if (text.includes("plan = 'none'") && row.plan !== 'none') {
            return false;
          }
          if (
            text.includes('preview_started_at IS NOT NULL') &&
            row.previewStartedAt === null
          ) {
            return false;
          }
          if (
            text.includes('email_confirmed_at IS NOT NULL') &&
            row.emailConfirmedAt === null
          ) {
            return false;
          }
          if (text.includes('btrim(u.email)') && row.email.trim() === '') {
            return false;
          }
          if (
            !text.includes('make_interval') ||
            row.previewStartedAt === null
          ) {
            return false;
          }
          const start = row.previewStartedAt.getTime();
          if (now.getTime() < start + warningDay * DAY_MS) return false;
          if (now.getTime() >= start + trialDays * DAY_MS) return false;
          if (text.includes("'active'") && isEntitled(row, now)) return false;
          if (
            text.includes('email_outbox') &&
            visibleToSelect.has(`preview_ending:${row.id}`)
          ) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          const aStart = a.previewStartedAt?.getTime() ?? 0;
          const bStart = b.previewStartedAt?.getTime() ?? 0;
          return aStart - bStart;
        })
        .slice(0, batch);
      return matched.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        preview_started_at: row.previewStartedAt,
      }));
    },
  } as unknown as Database;

  const emails = {
    enqueue: async (
      kind: string,
      to: string,
      data: Record<string, unknown>,
      idempotencyKey: string,
      tenantId: string | null,
    ) => {
      if (stored.has(idempotencyKey)) return false;
      stored.set(idempotencyKey, {
        kind,
        to,
        data,
        idempotencyKey,
        tenantId,
      });
      visibleToSelect.add(idempotencyKey);
      return true;
    },
  } as unknown as EmailOutboxService;

  return {
    notifier: new PreviewNotifierService(db, emails, preview(env)),
    stored,
    queryCount: () => queries,
    hold: () => {
      holdQuery = true;
    },
    release: () => {
      holdQuery = false;
      releaseQuery?.();
    },
  };
}

function due(overrides: Partial<Fixture> = {}): Fixture {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Café Norte',
    email: 'owner@example.com',
    emailConfirmedAt: new Date('2026-01-01T00:00:00.000Z'),
    plan: 'none',
    previewStartedAt: daysBefore(10),
    status: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

describe('PreviewNotifierService', () => {
  it('enqueues one preview_ending for a tenant inside the warning window', async () => {
    const started = daysBefore(10);
    const { notifier, stored } = harness([due({ previewStartedAt: started })]);
    const count = await notifier.notify(NOW);
    assert.equal(count, 1);
    const row = stored.get(
      'preview_ending:11111111-1111-4111-8111-111111111111',
    );
    assert.ok(row);
    assert.equal(row.kind, 'preview_ending');
    assert.equal(row.to, 'owner@example.com');
    assert.equal(row.tenantId, '11111111-1111-4111-8111-111111111111');
    assert.equal(row.data.siteName, 'Café Norte');
    assert.equal(
      row.data.endsAt,
      new Date(started.getTime() + 14 * DAY_MS).toISOString(),
    );
  });

  it('skips tenants outside the window, entitled, unverified, or not on the free plan', async () => {
    const futureEnd = new Date(NOW.getTime() + DAY_MS);
    const { notifier, stored } = harness([
      due({ id: 'too-early', previewStartedAt: daysBefore(9) }),
      due({ id: 'expired', previewStartedAt: daysBefore(14) }),
      due({
        id: 'paid',
        status: 'active',
        currentPeriodEnd: futureEnd,
      }),
      due({
        id: 'trialing',
        status: 'trialing',
        currentPeriodEnd: futureEnd,
      }),
      due({ id: 'unverified', emailConfirmedAt: null }),
      due({ id: 'blank-email', email: '  ' }),
      due({ id: 'unstarted', previewStartedAt: null }),
      due({ id: 'other-plan', plan: 'basico' }),
      due({
        id: 'lapsed-period',
        status: 'active',
        currentPeriodEnd: new Date(NOW.getTime() - DAY_MS),
      }),
      due({ id: 'past-due', status: 'past_due', currentPeriodEnd: futureEnd }),
    ]);
    const count = await notifier.notify(NOW);
    assert.equal(count, 2);
    assert.deepEqual(
      [...stored.keys()].sort(),
      ['preview_ending:lapsed-period', 'preview_ending:past-due'].sort(),
    );
  });

  it('uses a short trial and its warning day from config', async () => {
    const { notifier, stored } = harness(
      [
        due({ id: 'before', previewStartedAt: daysBefore(1) }),
        due({ id: 'inside', previewStartedAt: daysBefore(2) }),
        due({ id: 'ended', previewStartedAt: daysBefore(3) }),
      ],
      { PREVIEW_TRIAL_DAYS: '3', PREVIEW_WARNING_DAY: '2' },
    );
    const count = await notifier.notify(NOW);
    assert.equal(count, 1);
    const row = stored.get('preview_ending:inside');
    assert.ok(row);
    assert.equal(
      row.data.endsAt,
      new Date(daysBefore(2).getTime() + 3 * DAY_MS).toISOString(),
    );
  });

  it('does not scan when the warning day is 0 or a switch is off', async () => {
    const off: Record<string, string>[] = [
      { PREVIEW_TRIAL_DAYS: '1' },
      { PREVIEW_NOTIFY_ENABLED: 'false' },
      { PREVIEW_ENABLED: 'false' },
    ];
    for (const env of off) {
      const { notifier, queryCount } = harness([due()], env);
      assert.equal(await notifier.notify(NOW), 0);
      assert.equal(queryCount(), 0);
    }
  });

  it('does not enqueue the same tenant twice and continues with the next batch', async () => {
    const older = daysBefore(12);
    const newer = daysBefore(11);
    const { notifier, stored } = harness(
      [
        due({ id: 'older', previewStartedAt: older }),
        due({ id: 'newer', previewStartedAt: newer }),
      ],
      { PREVIEW_NOTIFY_BATCH: '1' },
    );
    assert.equal(await notifier.notify(NOW), 1);
    assert.equal(await notifier.notify(NOW), 1);
    assert.equal(stored.size, 2);
    assert.equal(
      stored.get('preview_ending:older')?.data.endsAt,
      new Date(older.getTime() + 14 * DAY_MS).toISOString(),
    );
    assert.ok(stored.has('preview_ending:newer'));
  });

  it('treats a unique-key conflict as already queued', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const { notifier, stored } = harness(
      [due()],
      {},
      {
        preseededKeys: [`preview_ending:${id}`],
      },
    );
    assert.equal(await notifier.notify(NOW), 0);
    assert.equal(stored.size, 1);
  });

  it('waits out the notify interval and skips an overlapping run', async () => {
    const { notifier, queryCount } = harness([due()], {
      PREVIEW_NOTIFY_INTERVAL_MINUTES: '60',
    });
    assert.equal(await notifier.runScheduled(NOW), 1);
    assert.equal(
      await notifier.runScheduled(new Date(NOW.getTime() + 30 * 60_000)),
      0,
    );
    assert.equal(queryCount(), 1);

    const overlapping = harness([due({ id: 'other' })]);
    overlapping.hold();
    const first = overlapping.notifier.runScheduled(NOW);
    const second = overlapping.notifier.runScheduled(
      new Date(NOW.getTime() + 2 * 60 * 60_000),
    );
    assert.equal(await second, 0);
    overlapping.release();
    assert.equal(await first, 1);
    assert.equal(overlapping.queryCount(), 1);
  });
});
