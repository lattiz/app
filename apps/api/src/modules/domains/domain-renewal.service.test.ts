import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { SettingsService } from '../../common/settings/settings.service';
import type { Database } from '../../database/database.module';
import type { AdminAlertService } from '../email/application/admin-alert.service';
import type { EmailOutboxService } from '../email/application/email-outbox.service';
import { DomainRenewalConfig } from './domain-renewal.config';
import { DomainRenewalService } from './domain-renewal.service';
import { RENEWAL_DAY_MS } from './domain/domain-renewal.policy';
import type { RegistrarPort } from './domain/registrar.port';
import type { DomainsService } from './domains.service';

const dialect = new PgDialect();
const DAY = RENEWAL_DAY_MS;
const NOW = new Date('2026-06-15T12:00:00.000Z');
const TENANT_A = '22222222-2222-4222-8222-222222222222';
const TENANT_B = '33333333-3333-4333-8333-333333333333';
const DOMAIN_A = '11111111-1111-4111-8111-111111111111';
const DOMAIN_B = '44444444-4444-4444-8444-444444444444';

interface Candidate {
  id: string;
  tenant_id: string;
  domain: string;
  registrar_domain_id: string;
  expires_at: Date;
  plan: string | null;
}

interface QueryCall {
  sql: string;
  params: unknown[];
}

interface HarnessOptions {
  enabled?: boolean;
  candidates?: Candidate[];
  openCycles?: { id: string }[];
  overdueCycles?: Array<{ id: string; tenant_id: string } & Record<string, unknown>>;
  renewalDate?: Date | null;
  lifecycleError?: Error;
  failFirstInsert?: boolean;
  releaseError?: Error;
  releaseAttempts?: number;
  activeCycle?: Record<string, unknown> | null;
  noticeCycles?: NoticeCycle[];
  noticeDaysBefore?: number[];
  failNoticeTenant?: string;
}

interface NoticeCycle {
  id: string;
  tenant_id: string;
  domain: string;
  expires_at: Date;
  late_deadline_at: Date | null;
  base_amount_cents: number;
  tax_amount_cents: number;
  amount_cents: number;
  currency: string;
  subscription_status: string | null;
  current_period_end: string | Date | null;
}

interface EnqueuedMail {
  kind: string;
  tenantId: string;
  data: Record<string, unknown>;
  key: string;
}

interface RecordedAlert {
  key: string;
  summary: string;
  details: Record<string, string | number | null>;
}

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: DOMAIN_A,
    tenant_id: TENANT_A,
    domain: 'cafe.mx',
    registrar_domain_id: 'op-1',
    expires_at: new Date(NOW.getTime() + 10 * DAY),
    plan: 'basico',
    ...overrides,
  };
}

function noticeCycle(overrides: Partial<NoticeCycle> = {}): NoticeCycle {
  const expiresAt = overrides.expires_at ?? new Date(NOW.getTime() + 14 * DAY);
  return {
    id: '77777777-7777-4777-8777-777777777777',
    tenant_id: TENANT_A,
    domain: 'cafe.mx',
    expires_at: expiresAt,
    late_deadline_at: new Date(expiresAt.getTime() + 15 * DAY),
    base_amount_cents: 59900,
    tax_amount_cents: 9584,
    amount_cents: 69484,
    currency: 'mxn',
    subscription_status: 'active',
    current_period_end: '2099-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function kindOf(text: string): string {
  const sqlText = text.replace(/\s+/g, ' ');
  if (sqlText.includes('subscription_status')) return 'notices';
  if (sqlText.includes('INSERT INTO public.domain_maintenance_cycles')) {
    return 'insert';
  }
  if (sqlText.includes('last_error')) return 'last-error';
  if (sqlText.includes("status = 'lapsed'")) return 'lapse';
  if (sqlText.includes("SET status = 'overdue'")) return 'mark-overdue';
  if (sqlText.includes('UPDATE public.domains')) return 'move-expiry';
  if (sqlText.includes('JOIN public.tenants')) return 'candidates';
  if (sqlText.includes('renewal_failed')) return 'active';
  if (sqlText.includes("status = 'open'")) return 'due-open';
  if (sqlText.includes("status = 'overdue'")) return 'due-lapse';
  throw new Error(`unexpected SQL: ${sqlText}`);
}

async function harness(options: HarnessOptions = {}) {
  const settings = new SettingsService(
    { get: () => undefined } as unknown as ConfigService,
    {
      loadAll: async () =>
        new Map<string, unknown>([
          ['domain.renewal.enabled', options.enabled !== false],
          ...(options.noticeDaysBefore === undefined
            ? []
            : [
                [
                  'domain.renewal.notice_days_before',
                  options.noticeDaysBefore,
                ] as const,
              ]),
        ]),
    },
  );
  await settings.reload();
  const config = new DomainRenewalConfig(settings);

  const calls: QueryCall[] = [];
  const lifecycles: string[] = [];
  const released: string[] = [];
  let inserts = 0;
  const candidates = options.candidates ?? [];
  const byRegistrar = new Map(
    candidates.map((row) => [row.registrar_domain_id, row]),
  );

  const db = {
    execute: async (statement: SQL) => {
      const query = dialect.sqlToQuery(statement);
      assert.ok(
        query.params.every((param) => !(param instanceof Date)),
        'a Date was bound as a raw SQL parameter',
      );
      const call = { sql: query.sql, params: query.params };
      calls.push(call);
      const kind = kindOf(query.sql);
      if (kind === 'candidates') return candidates;
      if (kind === 'due-open') return options.openCycles ?? [];
      if (kind === 'due-lapse') return options.overdueCycles ?? [];
      if (kind === 'notices') return options.noticeCycles ?? [];
      if (kind === 'last-error') {
        return options.releaseAttempts === undefined
          ? []
          : [{ attempts: options.releaseAttempts }];
      }
      if (kind === 'active') {
        return options.activeCycle ? [options.activeCycle] : [];
      }
      if (kind === 'insert') {
        inserts += 1;
        if (options.failFirstInsert && inserts === 1) {
          throw new Error('insert failed');
        }
        return [{ id: `cycle-${inserts}` }];
      }
      if (kind === 'mark-overdue' || kind === 'lapse') {
        return [{ id: 'updated' }];
      }
      return [];
    },
  } as unknown as Database;

  const registrar = {
    getLifecycle: async (id: string) => {
      lifecycles.push(id);
      if (options.lifecycleError) throw options.lifecycleError;
      const row = byRegistrar.get(id);
      const stored = row?.expires_at ?? NOW;
      const renewalDate =
        options.renewalDate === undefined ? stored : options.renewalDate;
      return {
        status: 'active' as const,
        renewalDate,
        canRenew: true,
        restorableUntil: null,
      };
    },
  } as unknown as RegistrarPort;

  const domains = {
    releaseDomain: async (tenantId: string) => {
      if (options.releaseError) throw options.releaseError;
      released.push(tenantId);
      return { released: true, domain: 'cafe.mx' };
    },
  } as unknown as DomainsService;

  const enqueued: EnqueuedMail[] = [];
  const alerts: RecordedAlert[] = [];
  const emails = {
    enqueueForTenant: async (
      kind: string,
      tenantId: string,
      data: Record<string, unknown>,
      key: string,
    ) => {
      if (options.failNoticeTenant === tenantId) {
        throw new Error('notice failed');
      }
      enqueued.push({ kind, tenantId, data, key });
    },
  } as unknown as EmailOutboxService;
  const adminAlerts = {
    alert: async (input: RecordedAlert) => {
      alerts.push(input);
    },
  } as unknown as AdminAlertService;

  return {
    service: new DomainRenewalService(
      db,
      registrar,
      config,
      domains,
      emails,
      adminAlerts,
    ),
    calls,
    lifecycles,
    released,
    enqueued,
    alerts,
    of: (kind: string) => calls.filter((call) => kindOf(call.sql) === kind),
  };
}

describe('DomainRenewalService', () => {
  it('does not query when renewal is disabled', async () => {
    const { service, calls } = await harness({ enabled: false });
    const fromRun = await service.run(NOW);
    const fromCron = await service.runScheduled(NOW);
    assert.equal(calls.length, 0);
    assert.deepEqual(fromRun, {
      opened: 0,
      overdue: 0,
      lapsed: 0,
      notices: 0,
      skipped: 0,
      errors: 0,
    });
    assert.deepEqual(fromCron, fromRun);
  });

  it('opens a cycle at 59900 / 9584 / 69484 inside the open window', async () => {
    const row = candidate();
    const { service, of, released } = await harness({ candidates: [row] });
    const summary = await service.run(NOW);
    assert.deepEqual(summary, {
      opened: 1,
      overdue: 0,
      lapsed: 0,
      notices: 0,
      skipped: 0,
      errors: 0,
    });
    assert.equal(released.length, 0);
    assert.equal(of('move-expiry').length, 0);
    const insert = of('insert');
    assert.equal(insert.length, 1);
    assert.match(insert[0].sql, /'mxn'/);
    assert.match(insert[0].sql, /ON CONFLICT \(domain_id, expires_at\)/);
    assert.match(insert[0].sql, /status <> 'void'/);
    assert.deepEqual(
      insert[0].params.filter((param) => typeof param === 'number'),
      [59900, 9584, 69484],
    );
    assert.ok(insert[0].params.includes('open'));
    assert.match(insert[0].sql, /SELECT expires_at FROM public\.domains/);
    assert.ok(insert[0].params.includes(NOW.toISOString()));
  });

  it('opens an already-late domain straight into overdue', async () => {
    const expiresAt = new Date(NOW.getTime() - DAY);
    const { service, of } = await harness({
      candidates: [candidate({ expires_at: expiresAt })],
    });
    const summary = await service.run(NOW);
    assert.equal(summary.opened, 1);
    assert.equal(summary.overdue, 0);
    const insert = of('insert')[0];
    assert.ok(insert.params.includes('overdue'));
    assert.ok(!insert.params.includes('open'));
    assert.ok(
      insert.params.includes(
        new Date(expiresAt.getTime() + 15 * DAY).toISOString(),
      ),
    );
  });

  it('updates expires_at and does not insert when the registrar date differs by more than a day', async () => {
    const stored = new Date(NOW.getTime() + 10 * DAY);
    const reported = new Date(stored.getTime() + DAY + 1);
    const { service, of } = await harness({
      candidates: [candidate({ expires_at: stored })],
      renewalDate: reported,
    });
    const summary = await service.run(NOW);
    assert.equal(summary.opened, 0);
    assert.equal(of('insert').length, 0);
    const update = of('move-expiry');
    assert.equal(update.length, 1);
    assert.ok(update[0].params.includes(reported.toISOString()));
    assert.ok(update[0].params.every((param) => !(param instanceof Date)));
  });

  it('still opens when the registrar date is exactly one day off', async () => {
    const stored = new Date(NOW.getTime() + 10 * DAY);
    const reported = new Date(stored.getTime() + DAY);
    const { service, of } = await harness({
      candidates: [candidate({ expires_at: stored })],
      renewalDate: reported,
    });
    const summary = await service.run(NOW);
    assert.equal(summary.opened, 1);
    assert.equal(of('move-expiry').length, 0);
    assert.match(of('insert')[0].sql, /SELECT expires_at FROM public\.domains/);
  });

  it('counts a registrar failure as skipped and does not throw or insert', async () => {
    const { service, of } = await harness({
      candidates: [candidate()],
      lifecycleError: new Error('registrar down'),
    });
    const summary = await service.run(NOW);
    assert.equal(summary.skipped, 1);
    assert.equal(summary.opened, 0);
    assert.equal(summary.errors, 0);
    assert.equal(of('insert').length, 0);
    assert.equal(of('move-expiry').length, 0);
  });

  it('marks an open cycle overdue once it expires', async () => {
    const { service, of, released } = await harness({
      openCycles: [{ id: '55555555-5555-4555-8555-555555555555' }],
    });
    const summary = await service.run(NOW);
    assert.equal(summary.overdue, 1);
    assert.equal(summary.lapsed, 0);
    assert.equal(released.length, 0);
    const update = of('mark-overdue');
    assert.equal(update.length, 1);
    assert.match(update[0].sql, /SET status = 'overdue'/);
    assert.match(update[0].sql, /AND status = 'open'/);
    assert.match(update[0].sql, /make_interval\(days =>/);
    assert.ok(update[0].params.includes(NOW.toISOString()));
    assert.ok(update[0].params.includes(15));
  });

  it('lapses an overdue cycle by releasing the domain', async () => {
    const { service, of, released } = await harness({
      overdueCycles: [
        { id: '66666666-6666-4666-8666-666666666666', tenant_id: TENANT_A },
      ],
    });
    const summary = await service.run(NOW);
    assert.equal(summary.lapsed, 1);
    assert.equal(summary.errors, 0);
    assert.deepEqual(released, [TENANT_A]);
    const update = of('lapse');
    assert.equal(update.length, 1);
    assert.match(update[0].sql, /SET status = 'lapsed'/);
    assert.match(update[0].sql, /AND status = 'overdue'/);
    assert.equal(of('last-error').length, 0);
  });

  it('keeps the cycle overdue and stores the error when release throws', async () => {
    const cycleId = '66666666-6666-4666-8666-666666666666';
    const { service, of, released } = await harness({
      overdueCycles: [{ id: cycleId, tenant_id: TENANT_A }],
      releaseError: new Error('zone busy'),
    });
    const summary = await service.run(NOW);
    assert.equal(summary.lapsed, 0);
    assert.equal(summary.errors, 1);
    assert.deepEqual(released, []);
    assert.equal(of('lapse').length, 0);
    const errorUpdate = of('last-error');
    assert.equal(errorUpdate.length, 1);
    assert.match(errorUpdate[0].sql, /attempts = attempts \+ 1/);
    assert.match(errorUpdate[0].sql, /status = 'overdue'/);
    assert.ok(!errorUpdate[0].sql.includes("status = 'lapsed'"));
    assert.ok(errorUpdate[0].params.includes('zone busy'));
    assert.ok(errorUpdate[0].params.includes(cycleId));
  });

  it('keeps going when one domain fails', async () => {
    const { service, lifecycles } = await harness({
      failFirstInsert: true,
      candidates: [
        candidate(),
        candidate({
          id: DOMAIN_B,
          tenant_id: TENANT_B,
          domain: 'norte.mx',
          registrar_domain_id: 'op-2',
        }),
      ],
    });
    const summary = await service.run(NOW);
    assert.deepEqual(lifecycles, ['op-1', 'op-2']);
    assert.equal(summary.opened, 1);
    assert.equal(summary.errors, 1);
    assert.equal(summary.skipped, 0);
  });

  it('reads the newest live cycle for a tenant', async () => {
    const expiresAt = new Date(NOW.getTime() + 10 * DAY);
    const lateDeadlineAt = new Date(expiresAt.getTime() + 15 * DAY);
    const { service } = await harness({
      activeCycle: {
        id: '77777777-7777-4777-8777-777777777777',
        domain_id: DOMAIN_A,
        tenant_id: TENANT_A,
        domain: 'cafe.mx',
        status: 'paid',
        expires_at: expiresAt,
        late_deadline_at: lateDeadlineAt,
        base_amount_cents: 59900,
        tax_amount_cents: 9584,
        amount_cents: 69484,
        currency: 'mxn',
      },
    });
    const view = await service.findActiveCycleForTenant(TENANT_A);
    assert.deepEqual(view, {
      cycleId: '77777777-7777-4777-8777-777777777777',
      domainId: DOMAIN_A,
      tenantId: TENANT_A,
      domain: 'cafe.mx',
      status: 'paid',
      expiresAt,
      lateDeadlineAt,
      baseCents: 59900,
      taxCents: 9584,
      totalCents: 69484,
      currency: 'mxn',
    });

    const { service: empty } = await harness({ activeCycle: null });
    assert.equal(await empty.findActiveCycleForTenant(TENANT_A), null);
  });

  it('enqueues the notice that the cycle has reached, once per cycle', async () => {
    const upcoming = noticeCycle();
    const expired = noticeCycle({
      id: '88888888-8888-4888-8888-888888888888',
      tenant_id: TENANT_B,
      domain: 'norte.mx',
      expires_at: NOW,
      subscription_status: 'canceled',
      current_period_end: '2099-01-01T00:00:00.000Z',
    });
    const late = noticeCycle({
      id: '99999999-9999-4999-8999-999999999999',
      tenant_id: '55555555-5555-4555-8555-555555555555',
      domain: 'sur.mx',
      expires_at: new Date(NOW.getTime() - 7 * DAY),
    });
    const { service, enqueued, of } = await harness({
      noticeCycles: [upcoming, expired, late],
    });
    const summary = await service.run(NOW);
    assert.equal(of('notices').length, 1);
    assert.equal(summary.notices, 3);
    assert.equal(summary.errors, 0);
    assert.deepEqual(
      enqueued.map((mail) => ({ kind: mail.kind, key: mail.key })),
      [
        {
          kind: 'renewal_upcoming',
          key: `renewal:${upcoming.id}:before:14`,
        },
        {
          kind: 'domain_expired',
          key: `renewal:${expired.id}:before:0`,
        },
        {
          kind: 'renewal_last_notice',
          key: `renewal:${late.id}:after:7`,
        },
      ],
    );
    assert.equal(enqueued[0].data.daysLeft, 14);
    assert.equal(enqueued[0].data.subscriptionActive, true);
    assert.equal(enqueued[0].data.totalCents, 69484);
    assert.equal(enqueued[1].data.daysLeft, 0);
    assert.equal(enqueued[1].data.subscriptionActive, false);
    assert.equal(enqueued[2].data.daysLeft, 8);
  });

  it('does not enqueue when no notice threshold has been reached', async () => {
    const { service, enqueued } = await harness({
      noticeDaysBefore: [3],
      noticeCycles: [noticeCycle()],
    });
    const summary = await service.run(NOW);
    assert.equal(summary.notices, 0);
    assert.deepEqual(enqueued, []);
  });

  it('keeps notifying the other cycles when one notice fails', async () => {
    const { service, enqueued } = await harness({
      failNoticeTenant: TENANT_A,
      noticeCycles: [
        noticeCycle(),
        noticeCycle({
          id: '88888888-8888-4888-8888-888888888888',
          tenant_id: TENANT_B,
          domain: 'norte.mx',
        }),
      ],
    });
    const summary = await service.run(NOW);
    assert.equal(summary.errors, 1);
    assert.equal(summary.notices, 1);
    assert.equal(enqueued.length, 1);
    assert.equal(enqueued[0].tenantId, TENANT_B);
  });

  it('enqueues domain_lost after a cycle lapses', async () => {
    const cycleId = '66666666-6666-4666-8666-666666666666';
    const expiresAt = new Date(NOW.getTime() - 16 * DAY);
    const { service, enqueued } = await harness({
      overdueCycles: [
        {
          id: cycleId,
          tenant_id: TENANT_A,
          domain: 'cafe.mx',
          expires_at: expiresAt,
          late_deadline_at: new Date(expiresAt.getTime() + 15 * DAY),
          base_amount_cents: 59900,
          tax_amount_cents: 9584,
          amount_cents: 69484,
          currency: 'mxn',
        },
      ],
    });
    const summary = await service.run(NOW);
    assert.equal(summary.lapsed, 1);
    assert.equal(enqueued.length, 1);
    assert.equal(enqueued[0].kind, 'domain_lost');
    assert.equal(enqueued[0].key, `renewal:${cycleId}:lost`);
    assert.equal(enqueued[0].data.domain, 'cafe.mx');
    assert.equal(enqueued[0].data.expiresAt, expiresAt.toISOString());
  });

  it('alerts the owner after three failed releases and stays quiet before that', async () => {
    const cycleId = '66666666-6666-4666-8666-666666666666';
    const quiet = await harness({
      overdueCycles: [{ id: cycleId, tenant_id: TENANT_A, domain: 'cafe.mx' }],
      releaseError: new Error('zone busy'),
      releaseAttempts: 2,
    });
    await quiet.service.run(NOW);
    assert.equal(quiet.alerts.length, 0);

    const loud = await harness({
      overdueCycles: [{ id: cycleId, tenant_id: TENANT_A, domain: 'cafe.mx' }],
      releaseError: new Error('zone busy'),
      releaseAttempts: 3,
    });
    const summary = await loud.service.run(NOW);
    assert.equal(summary.lapsed, 0);
    assert.equal(summary.errors, 1);
    assert.equal(loud.alerts.length, 1);
    assert.equal(loud.alerts[0].key, `renewal_release:${cycleId}`);
    assert.equal(loud.alerts[0].details.dominio, 'cafe.mx');
    assert.equal(loud.alerts[0].details.ultimo_error, 'zone busy');
  });
});
