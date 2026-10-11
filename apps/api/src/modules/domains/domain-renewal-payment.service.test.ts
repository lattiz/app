import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type Stripe from 'stripe';
import { SettingsService } from '../../common/settings/settings.service';
import type { Database } from '../../database/database.module';
import { AdminAlertService } from '../email/application/admin-alert.service';
import type { EmailOutboxService } from '../email/application/email-outbox.service';
import { DomainRenewalConfig } from './domain-renewal.config';
import { DomainRenewalPaymentService } from './domain-renewal-payment.service';
import type { RenewalCycleView } from './domain-renewal.service';
import type { DomainRenewalService } from './domain-renewal.service';
import { RENEWAL_DAY_MS } from './domain/domain-renewal.policy';
import type { DomainPriceCaps } from './domain/domain-pricing.policy';
import type {
  RegistrarLifecycleStatus,
  RegistrarPort,
} from './domain/registrar.port';
import {
  DomainsTenantNotFoundException,
  RegistrarDomainNotActiveException,
  RenewalAlreadyPaidException,
  RenewalNotDueException,
  RenewalRequiresActiveSubscriptionException,
  RenewalWindowClosedException,
} from './domains.exceptions';
import type { DomainsService } from './domains.service';

const dialect = new PgDialect();
const DAY = RENEWAL_DAY_MS;
const NOW = new Date('2026-06-15T12:00:00.000Z');
const EXPIRES = new Date('2026-07-01T00:00:00.000Z');
const RENEWED = new Date(EXPIRES.getTime() + 400 * DAY);
const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TENANT = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const DOMAIN_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const CYCLE = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const CYCLE_B = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const APP = 'https://app.lattiz.test';

const errors: string[] = [];
const logs: string[] = [];
const originalError = Logger.prototype.error;
const originalLog = Logger.prototype.log;

before(() => {
  Logger.prototype.error = ((message?: unknown) => {
    errors.push(String(message));
  }) as typeof Logger.prototype.error;
  Logger.prototype.log = ((message?: unknown) => {
    logs.push(String(message));
  }) as typeof Logger.prototype.log;
});

after(() => {
  Logger.prototype.error = originalError;
  Logger.prototype.log = originalLog;
});

beforeEach(() => {
  errors.length = 0;
  logs.length = 0;
});

interface StoredCycle {
  id: string;
  status: string;
  tenant_id: string;
  domain_id: string;
  domain: string;
  registrar_domain_id: string | null;
  expires_at: Date;
  attempts: number;
  stripe_payment_intent_id: string | null;
  renewal_attempt_started_at: Date | null;
  renewal_cost_usd_cents: number | null;
  last_error: string | null;
  amount_cents?: number | null;
  base_amount_cents?: number | null;
  tax_amount_cents?: number | null;
  currency?: string;
  plan?: string | null;
}

interface TenantRow {
  id: string;
  stripe_customer_id: string | null;
  status: string | null;
  current_period_end: string | Date | null;
}

interface ScriptedLifecycle {
  status: RegistrarLifecycleStatus;
  renewalDate: Date | null;
}

interface QueryCall {
  sql: string;
  params: unknown[];
}

interface HarnessOptions {
  enabled?: boolean;
  maxAttempts?: number;
  tenant?: TenantRow | null;
  cycle?: RenewalCycleView | null;
  cycles?: StoredCycle[];
  lifecycles?: ScriptedLifecycle[];
  renewErrors?: Error[];
  restoreError?: Error;
  priceError?: Error;
  priceUsdCents?: number;
  redelegateError?: Error;
  failClaimIds?: string[];
  listError?: Error;
  holdList?: Promise<void>;
  checkoutUrl?: string | null;
  adminEmail?: string;
  caps?: DomainPriceCaps;
}

function stored(overrides: Partial<StoredCycle> = {}): StoredCycle {
  return {
    id: CYCLE,
    status: 'paid',
    tenant_id: TENANT,
    domain_id: DOMAIN_ID,
    domain: 'cafe.mx',
    registrar_domain_id: 'op-1',
    expires_at: EXPIRES,
    attempts: 0,
    stripe_payment_intent_id: 'pi_1',
    renewal_attempt_started_at: null,
    renewal_cost_usd_cents: null,
    last_error: null,
    ...overrides,
  };
}

function cycleView(
  overrides: Partial<RenewalCycleView> = {},
): RenewalCycleView {
  return {
    cycleId: CYCLE,
    domainId: DOMAIN_ID,
    tenantId: TENANT,
    domain: 'cafe.mx',
    status: 'open',
    expiresAt: EXPIRES,
    lateDeadlineAt: new Date(Date.now() + 10 * DAY),
    baseCents: 59900,
    taxCents: 9584,
    totalCents: 69484,
    currency: 'mxn',
    ...overrides,
  };
}

function entitledTenant(overrides: Partial<TenantRow> = {}): TenantRow {
  return {
    id: TENANT,
    stripe_customer_id: 'cus_1',
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * DAY),
    ...overrides,
  };
}

function life(
  status: RegistrarLifecycleStatus,
  renewalDate: Date | null,
): ScriptedLifecycle {
  return { status, renewalDate };
}

function session(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: 'cs_test',
    payment_status: 'paid',
    payment_intent: 'pi_1',
    metadata: {
      kind: 'domain_renewal',
      cycle_id: CYCLE,
      tenant_id: TENANT,
      domain_id: DOMAIN_ID,
    },
    ...overrides,
  } as Stripe.Checkout.Session;
}

function kindOf(text: string): string {
  const sqlText = text.replace(/\s+/g, ' ');
  if (sqlText.includes("SET status = 'paid'")) return 'mark-paid';
  if (sqlText.includes('renewal_attempt_started_at =')) return 'claim';
  if (sqlText.includes("status = 'renewed'")) return 'mark-renewed';
  if (sqlText.includes('attempts = attempts + 1')) return 'record-failure';
  if (sqlText.includes('UPDATE public.domains')) return 'mark-expiry';
  if (sqlText.includes('FROM public.tenants')) return 'tenant';
  if (sqlText.includes('stripe_payment_intent_id')) return 'read-cycle';
  if (sqlText.includes("WHERE status = 'paid'")) return 'list-paid';
  throw new Error(`unexpected SQL: ${sqlText}`);
}

function isIso(value: unknown): value is string {
  return typeof value === 'string' && value.includes('T');
}

async function harness(options: HarnessOptions = {}) {
  const settings = new SettingsService(
    { get: () => undefined } as unknown as ConfigService,
    {
      loadAll: async () =>
        new Map<string, unknown>([
          ['domain.renewal.enabled', options.enabled !== false],
          ...(options.adminEmail === undefined
            ? []
            : [['alerts.admin_email', options.adminEmail] as const]),
          ...(options.maxAttempts === undefined
            ? []
            : [
                [
                  'domain.renewal.max_registrar_attempts',
                  options.maxAttempts,
                ] as const,
              ]),
        ]),
    },
  );
  await settings.reload();
  const config = new DomainRenewalConfig(settings);

  const cycles = new Map(
    (options.cycles ?? [stored()]).map((cycle) => [cycle.id, cycle]),
  );
  const domainExpires = new Map<string, string>();
  const calls: QueryCall[] = [];
  const renewErrors = [...(options.renewErrors ?? [])];
  const lifecycles = [...(options.lifecycles ?? [])];

  const cycleFrom = (params: unknown[]): StoredCycle | undefined => {
    const id = params.find(
      (param): param is string =>
        typeof param === 'string' && cycles.has(param),
    );
    return id ? cycles.get(id) : undefined;
  };

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
      const cycle = cycleFrom(query.params);

      if (kind === 'tenant') {
        return options.tenant === undefined
          ? [entitledTenant()]
          : options.tenant
            ? [options.tenant]
            : [];
      }
      if (kind === 'list-paid') {
        if (options.holdList) await options.holdList;
        if (options.listError) throw options.listError;
        return [...cycles.values()]
          .filter((row) => row.status === 'paid')
          .sort((a, b) => a.id.localeCompare(b.id))
          .slice(0, 20)
          .map((row) => ({ id: row.id }));
      }
      if (kind === 'mark-paid') {
        if (!cycle) return [];
        if (cycle.status !== 'open' && cycle.status !== 'overdue') return [];
        cycle.status = 'paid';
        cycle.attempts = 0;
        cycle.last_error = null;
        const intent = query.params[2];
        cycle.stripe_payment_intent_id =
          typeof intent === 'string' ? intent : null;
        return [{ id: cycle.id }];
      }
      if (kind === 'read-cycle') {
        if (!cycle) return [];
        return [
          {
            status: cycle.status,
            stripe_payment_intent_id: cycle.stripe_payment_intent_id,
            tenant_id: cycle.tenant_id,
          },
        ];
      }
      if (kind === 'claim') {
        if (cycle && options.failClaimIds?.includes(cycle.id)) {
          throw new Error('claim exploded');
        }
        if (!cycle || cycle.status !== 'paid') return [];
        const cutoff = query.params.filter(isIso)[1];
        const started = cycle.renewal_attempt_started_at;
        if (started && started.toISOString() >= cutoff) return [];
        const nowIso = query.params.filter(isIso)[0];
        cycle.renewal_attempt_started_at = new Date(nowIso);
        return [
          {
            tenant_id: cycle.tenant_id,
            domain_id: cycle.domain_id,
            domain: cycle.domain,
            registrar_domain_id: cycle.registrar_domain_id,
            expires_at: cycle.expires_at,
            attempts: cycle.attempts,
            stripe_payment_intent_id: cycle.stripe_payment_intent_id,
            amount_cents: cycle.amount_cents ?? null,
            base_amount_cents: cycle.base_amount_cents ?? null,
            tax_amount_cents: cycle.tax_amount_cents ?? null,
            currency: cycle.currency ?? 'mxn',
            plan: cycle.plan ?? null,
          },
        ];
      }
      if (kind === 'mark-expiry') {
        const when = query.params.find(isIso);
        const domainId = query.params.find(
          (param): param is string =>
            typeof param === 'string' && !isIso(param),
        );
        if (when && domainId) domainExpires.set(domainId, when);
        return [];
      }
      if (kind === 'mark-renewed') {
        if (!cycle || cycle.status !== 'paid') return [];
        cycle.status = 'renewed';
        const cost = query.params[1];
        cycle.renewal_cost_usd_cents = typeof cost === 'number' ? cost : null;
        return [{ id: cycle.id }];
      }
      if (kind === 'record-failure') {
        if (!cycle || cycle.status !== 'paid') return [];
        const next = cycle.attempts + 1;
        const max = query.params.find(
          (param): param is number => typeof param === 'number',
        );
        cycle.attempts = next;
        cycle.last_error = String(query.params[0]);
        if (max !== undefined && next >= max) cycle.status = 'renewal_failed';
        return [{ attempts: cycle.attempts, status: cycle.status }];
      }
      return [];
    },
  } as unknown as Database;

  const renewedCalls: Array<{ periodYears: number; domain: string }> = [];
  const restored: string[] = [];
  const redelegated: string[] = [];
  const registrar = {
    getLifecycle: async () => {
      const next = lifecycles.shift();
      if (!next) throw new Error('unexpected getLifecycle');
      return {
        status: next.status,
        renewalDate: next.renewalDate,
        canRenew: next.status === 'active',
        restorableUntil: null,
      };
    },
    renewDomain: async (params: { periodYears: number; domain: string }) => {
      renewedCalls.push({
        periodYears: params.periodYears,
        domain: params.domain,
      });
      const err = renewErrors.shift();
      if (err) throw err;
    },
    restoreDomain: async (params: { domain: string }) => {
      if (options.restoreError) throw options.restoreError;
      restored.push(params.domain);
    },
    getPriceUsdCents: async () => {
      if (options.priceError) throw options.priceError;
      return options.priceUsdCents ?? 1200;
    },
  } as unknown as RegistrarPort;

  const domains = {
    redelegateAfterRestore: async (tenantId: string) => {
      if (options.redelegateError) throw options.redelegateError;
      redelegated.push(tenantId);
    },
  } as unknown as DomainsService;

  let cycleLookups = 0;
  const renewalService = {
    findActiveCycleForTenant: async () => {
      cycleLookups += 1;
      return options.cycle === undefined ? null : options.cycle;
    },
  } as unknown as DomainRenewalService;

  const created: Stripe.Checkout.SessionCreateParams[] = [];
  const stripe = {
    checkout: {
      sessions: {
        create: async (params: Stripe.Checkout.SessionCreateParams) => {
          created.push(params);
          return {
            id: 'cs_test',
            url:
              options.checkoutUrl === undefined
                ? 'https://checkout.stripe.test/cs_test'
                : options.checkoutUrl,
          };
        },
      },
    },
  } as unknown as Stripe;

  const enqueued: Array<{
    kind: string;
    tenantId: string;
    data: Record<string, unknown>;
    key: string;
  }> = [];
  const adminMails: Array<{
    kind: string;
    to: string;
    data: Record<string, unknown>;
    key: string;
  }> = [];
  const emails = {
    enqueueForTenant: async (
      kind: string,
      tenantId: string,
      data: Record<string, unknown>,
      key: string,
    ) => {
      enqueued.push({ kind, tenantId, data, key });
    },
    enqueue: async (
      kind: string,
      to: string,
      data: Record<string, unknown>,
      key: string,
    ) => {
      adminMails.push({ kind, to, data, key });
      return true;
    },
  } as unknown as EmailOutboxService;
  const caps: DomainPriceCaps = options.caps ?? {
    purchaseUsdCents: 2000,
    basicRenewalUsdCents: 2000,
    proRenewalUsdCents: 4000,
  };

  return {
    service: new DomainRenewalPaymentService(
      db,
      stripe,
      registrar,
      config,
      renewalService,
      domains,
      emails,
      new AdminAlertService(settings, emails),
      caps,
    ),
    enqueued,
    adminMails,
    created,
    calls,
    cycles,
    domainExpires,
    renewedCalls,
    restored,
    redelegated,
    cycleLookups: () => cycleLookups,
    of: (kind: string) => calls.filter((call) => kindOf(call.sql) === kind),
  };
}

async function expectError(
  run: () => Promise<unknown>,
  ctor: new () => { code: string; status: number },
  code: string,
  status: number,
): Promise<void> {
  await assert.rejects(run, (err: unknown) => {
    assert.ok(err instanceof ctor);
    assert.equal(err.code, code);
    assert.equal(err.status, status);
    return true;
  });
}

describe('DomainRenewalPaymentService createCheckout', () => {
  it('rejects checkout when renewal is disabled, before any lookup', async () => {
    const { service, created, calls, cycleLookups } = await harness({
      enabled: false,
      cycle: cycleView(),
    });
    await expectError(
      () => service.createCheckout(USER, APP),
      RenewalNotDueException,
      'RENEWAL_NOT_DUE',
      409,
    );
    assert.equal(created.length, 0);
    assert.equal(calls.length, 0);
    assert.equal(cycleLookups(), 0);
  });

  it('rejects a missing tenant', async () => {
    const { service, created } = await harness({
      tenant: null,
      cycle: cycleView(),
    });
    await expectError(
      () => service.createCheckout(USER, APP),
      DomainsTenantNotFoundException,
      'TENANT_NOT_FOUND',
      404,
    );
    assert.equal(created.length, 0);
  });

  it('rejects a tenant with no live cycle', async () => {
    const { service, created } = await harness({ cycle: null });
    await expectError(
      () => service.createCheckout(USER, APP),
      RenewalNotDueException,
      'RENEWAL_NOT_DUE',
      409,
    );
    assert.equal(created.length, 0);
  });

  it('rejects a paid cycle and a renewal that already failed', async () => {
    for (const status of ['paid', 'renewal_failed'] as const) {
      const { service, created } = await harness({
        cycle: cycleView({ status }),
      });
      await expectError(
        () => service.createCheckout(USER, APP),
        RenewalAlreadyPaidException,
        'RENEWAL_ALREADY_PAID',
        409,
      );
      assert.equal(created.length, 0);
    }
  });

  it('rejects an overdue cycle whose late deadline has passed', async () => {
    const { service, created } = await harness({
      cycle: cycleView({
        status: 'overdue',
        lateDeadlineAt: new Date(Date.now() - 1000),
      }),
    });
    await expectError(
      () => service.createCheckout(USER, APP),
      RenewalWindowClosedException,
      'RENEWAL_WINDOW_CLOSED',
      409,
    );
    assert.equal(created.length, 0);
  });

  it('rejects a lapsed entitlement and a tenant with no Stripe customer', async () => {
    const cases: Array<Partial<TenantRow>> = [
      { status: 'past_due' },
      { current_period_end: new Date(Date.now() - 1000) },
      { stripe_customer_id: null },
      { status: 'trialing', current_period_end: new Date(Date.now() - 1000) },
    ];
    for (const tenant of cases) {
      const { service, created } = await harness({
        tenant: entitledTenant(tenant),
        cycle: cycleView(),
      });
      await expectError(
        () => service.createCheckout(USER, APP),
        RenewalRequiresActiveSubscriptionException,
        'RENEWAL_REQUIRES_ACTIVE_SUBSCRIPTION',
        403,
      );
      assert.equal(created.length, 0);
    }
  });

  it('charges the frozen 59900 + 9584 and does not store the link', async () => {
    const { service, created, of } = await harness({
      tenant: entitledTenant({ status: 'trialing' }),
      cycle: cycleView(),
    });
    const result = await service.createCheckout(USER, APP);
    assert.deepEqual(result, { url: 'https://checkout.stripe.test/cs_test' });
    assert.equal(created.length, 1);
    const params = created[0];
    assert.equal(params.mode, 'payment');
    assert.equal(params.customer, 'cus_1');
    assert.deepEqual(params.payment_method_types, ['card']);
    assert.deepEqual(params.metadata, {
      kind: 'domain_renewal',
      cycle_id: CYCLE,
      tenant_id: TENANT,
      domain_id: DOMAIN_ID,
    });
    assert.deepEqual(params.payment_intent_data?.metadata, params.metadata);
    assert.equal(params.success_url, `${APP}/dashboard/domain?renewal=success`);
    assert.equal(params.cancel_url, `${APP}/dashboard/domain?renewal=canceled`);
    assert.deepEqual(params.line_items, [
      {
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: 59900,
          product_data: { name: 'Renovación anual del dominio cafe.mx' },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: 9584,
          product_data: { name: 'IVA' },
        },
      },
    ]);
    const expiresAt = params.expires_at ?? 0;
    const delta = expiresAt - Math.floor(Date.now() / 1000);
    assert.ok(delta >= 1790 && delta <= 1810);
    assert.equal(of('tenant').length, 1);
    assert.equal(of('mark-paid').length, 0);
    assert.equal(of('claim').length, 0);
  });

  it('omits the IVA line when the frozen tax is zero and still accepts an open overdue window', async () => {
    const open = await harness({
      cycle: cycleView({
        taxCents: 0,
        lateDeadlineAt: new Date(Date.now() - DAY),
      }),
    });
    await open.service.createCheckout(USER, APP);
    assert.equal(open.created[0].line_items?.length, 1);
    assert.equal(
      open.created[0].line_items?.[0].price_data?.unit_amount,
      59900,
    );

    const overdue = await harness({
      cycle: cycleView({
        status: 'overdue',
        taxCents: 0,
        lateDeadlineAt: new Date(Date.now() + DAY),
      }),
    });
    await overdue.service.createCheckout(USER, APP);
    assert.equal(overdue.created[0].line_items?.length, 1);
    assert.equal(
      overdue.created[0].line_items?.[0].price_data?.product_data?.name,
      'Renovación anual del dominio cafe.mx',
    );
  });
});

describe('DomainRenewalPaymentService handleCheckoutCompleted', () => {
  it('ignores other kinds and unpaid renewal sessions', async () => {
    const { service, calls } = await harness();
    await service.handleCheckoutCompleted(
      session({ metadata: { kind: 'subscription', tenant_id: TENANT } }),
    );
    await service.handleCheckoutCompleted(
      session({ payment_status: 'unpaid' }),
    );
    assert.equal(calls.length, 0);
    assert.equal(logs.length, 2);
    assert.ok(logs.every((line) => line.includes('Ignoring checkout session')));
  });

  it('marks the cycle paid and fulfils it once', async () => {
    const { service, cycles, renewedCalls, domainExpires, of } = await harness({
      cycles: [stored({ status: 'open', stripe_payment_intent_id: null })],
      lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
    });
    await service.handleCheckoutCompleted(session());
    assert.equal(cycles.get(CYCLE)?.status, 'renewed');
    assert.equal(cycles.get(CYCLE)?.attempts, 0);
    assert.equal(cycles.get(CYCLE)?.stripe_payment_intent_id, 'pi_1');
    assert.equal(renewedCalls.length, 1);
    assert.equal(renewedCalls[0].periodYears, 1);
    assert.equal(domainExpires.get(DOMAIN_ID), RENEWED.toISOString());
    assert.match(of('mark-paid')[0].sql, /attempts = 0/);
    assert.match(of('mark-paid')[0].sql, /last_error = NULL/);
    assert.match(of('mark-paid')[0].sql, /status IN \('open', 'overdue'\)/);
  });

  it('does nothing when the same payment intent is delivered again', async () => {
    const { service, renewedCalls } = await harness({
      cycles: [stored({ status: 'open', stripe_payment_intent_id: null })],
      lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
    });
    await service.handleCheckoutCompleted(session());
    await service.handleCheckoutCompleted(session());
    assert.equal(renewedCalls.length, 1);
    assert.equal(errors.length, 0);
  });

  it('alerts and does not throw when the cycle can no longer be paid', async () => {
    const { service, renewedCalls } = await harness({
      cycles: [
        stored({
          status: 'lapsed',
          stripe_payment_intent_id: 'pi_old',
        }),
      ],
    });
    await assert.doesNotReject(() =>
      service.handleCheckoutCompleted(session({ payment_intent: 'pi_other' })),
    );
    assert.equal(renewedCalls.length, 0);
    assert.ok(
      errors.some((line) =>
        line.includes(`key=renewal_unpayable:pi_other`),
      ),
    );
  });

  it('does not propagate a registrar error after the cycle is paid', async () => {
    const { service, cycles } = await harness({
      cycles: [stored({ status: 'open', stripe_payment_intent_id: null })],
      lifecycles: [life('active', EXPIRES)],
      renewErrors: [new Error('registrar down')],
    });
    await assert.doesNotReject(() =>
      service.handleCheckoutCompleted(session()),
    );
    assert.equal(cycles.get(CYCLE)?.status, 'paid');
    assert.equal(cycles.get(CYCLE)?.attempts, 1);
    assert.match(cycles.get(CYCLE)?.last_error ?? '', /registrar down/);
  });
});

describe('DomainRenewalPaymentService fulfil', () => {
  it('renews an active domain once and stores the new expiry', async () => {
    const { service, cycles, renewedCalls, restored, domainExpires, of } =
      await harness({
        lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
      });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(renewedCalls.length, 1);
    assert.deepEqual(renewedCalls[0], { periodYears: 1, domain: 'cafe.mx' });
    assert.equal(restored.length, 0);
    assert.equal(cycles.get(CYCLE)?.status, 'renewed');
    assert.equal(cycles.get(CYCLE)?.renewal_cost_usd_cents, 1200);
    assert.equal(domainExpires.get(DOMAIN_ID), RENEWED.toISOString());
    assert.ok(
      of('claim')[0].params.includes(
        new Date(NOW.getTime() - 10 * 60 * 1000).toISOString(),
      ),
    );
  });

  it('does not renew again when the registrar date already moved', async () => {
    const { service, renewedCalls, restored, cycles } = await harness({
      lifecycles: [life('active', RENEWED), life('active', RENEWED)],
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(renewedCalls.length, 0);
    assert.equal(restored.length, 0);
    assert.equal(cycles.get(CYCLE)?.status, 'renewed');
    assert.equal(cycles.get(CYCLE)?.renewal_cost_usd_cents, null);
  });

  it('restores an expired domain and renews only when the date did not advance', async () => {
    const needsRenew = await harness({
      lifecycles: [
        life('expired', EXPIRES),
        life('active', EXPIRES),
        life('active', RENEWED),
      ],
    });
    assert.equal(await needsRenew.service.fulfil(CYCLE, NOW), 'renewed');
    assert.deepEqual(needsRenew.restored, ['cafe.mx']);
    assert.equal(needsRenew.renewedCalls.length, 1);
    assert.deepEqual(needsRenew.redelegated, [TENANT]);

    const alreadyAdvanced = await harness({
      lifecycles: [
        life('expired', EXPIRES),
        life('active', RENEWED),
        life('active', RENEWED),
      ],
    });
    assert.equal(await alreadyAdvanced.service.fulfil(CYCLE, NOW), 'renewed');
    assert.deepEqual(alreadyAdvanced.restored, ['cafe.mx']);
    assert.equal(alreadyAdvanced.renewedCalls.length, 0);
    assert.deepEqual(alreadyAdvanced.redelegated, [TENANT]);
  });

  it('keeps the cycle renewed when DNS re-delegation fails after a restore', async () => {
    const { service, cycles, redelegated } = await harness({
      lifecycles: [
        life('expired', EXPIRES),
        life('active', RENEWED),
        life('active', RENEWED),
      ],
      redelegateError: new Error('dns down'),
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(cycles.get(CYCLE)?.status, 'renewed');
    assert.equal(redelegated.length, 0);
    assert.ok(
      errors.some((line) =>
        line.includes(`key=renewal_dns:${CYCLE}`),
      ),
    );
  });

  it('retries a registrar error and stops with an alert at the attempt cap', async () => {
    const retry = await harness({
      lifecycles: [life('active', EXPIRES)],
      renewErrors: [new Error('registrar down')],
    });
    assert.equal(await retry.service.fulfil(CYCLE, NOW), 'retry');
    assert.equal(retry.cycles.get(CYCLE)?.attempts, 1);
    assert.equal(retry.cycles.get(CYCLE)?.status, 'paid');
    assert.match(retry.of('record-failure')[0].sql, /renewal_failed/);

    const again = await retry.service.fulfil(CYCLE, NOW);
    assert.equal(again, 'skipped');
    assert.equal(retry.cycles.get(CYCLE)?.attempts, 1);

    const failed = await harness({
      cycles: [stored({ attempts: 4 })],
      lifecycles: [life('pending', null)],
    });
    assert.equal(await failed.service.fulfil(CYCLE, NOW), 'failed');
    assert.equal(failed.renewedCalls.length, 0);
    assert.equal(failed.restored.length, 0);
    assert.equal(failed.cycles.get(CYCLE)?.status, 'renewal_failed');
    assert.equal(failed.cycles.get(CYCLE)?.attempts, 5);
    assert.ok(
      errors.some((line) =>
        line.includes(`key=renewal_failed:${CYCLE}`),
      ),
    );
  });

  it('returns skipped when the paid cycle cannot be claimed', async () => {
    const { service, renewedCalls } = await harness({
      cycles: [stored({ renewal_attempt_started_at: NOW })],
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'skipped');
    assert.equal(renewedCalls.length, 0);
  });

  it('still renews when the cost lookup fails', async () => {
    const { service, cycles, renewedCalls } = await harness({
      lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
      priceError: new Error('price down'),
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(renewedCalls.length, 1);
    assert.equal(cycles.get(CYCLE)?.renewal_cost_usd_cents, null);
  });

  it('treats a not-active renewal as a restore', async () => {
    const { service, renewedCalls, restored, redelegated } = await harness({
      lifecycles: [
        life('active', EXPIRES),
        life('active', EXPIRES),
        life('active', RENEWED),
      ],
      renewErrors: [new RegistrarDomainNotActiveException('op-1')],
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(restored.length, 1);
    assert.equal(renewedCalls.length, 2);
    assert.deepEqual(redelegated, [TENANT]);
  });

  it('enqueues domain_renewed with the new expiry', async () => {
    const { service, enqueued } = await harness({
      cycles: [
        stored({
          amount_cents: 69484,
          base_amount_cents: 59900,
          tax_amount_cents: 9584,
        }),
      ],
      lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(enqueued.length, 1);
    assert.equal(enqueued[0].kind, 'domain_renewed');
    assert.equal(enqueued[0].key, `renewal:${CYCLE}:renewed`);
    assert.equal(enqueued[0].data.expiresAt, RENEWED.toISOString());
    assert.equal(enqueued[0].data.siteWasOffline, false);
    assert.equal(enqueued[0].data.totalCents, 69484);
  });

  it('alerts when the renewal cost is above the plan cap and still renews', async () => {
    const { service, cycles, adminMails } = await harness({
      cycles: [stored({ plan: 'basico' })],
      lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
      priceUsdCents: 2500,
      caps: {
        purchaseUsdCents: 2000,
        basicRenewalUsdCents: 1500,
        proRenewalUsdCents: 4000,
      },
      adminEmail: 'ops@lattiz.app',
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(cycles.get(CYCLE)?.status, 'renewed');
    assert.ok(
      errors.some((line) => line.includes(`key=renewal_over_cap:${CYCLE}`)),
    );
    assert.equal(adminMails.length, 1);
    assert.equal(adminMails[0].key, `admin:renewal_over_cap:${CYCLE}`);
    assert.equal(adminMails[0].to, 'ops@lattiz.app');
  });

  it('does not alert over cap when the renewal cost is unknown', async () => {
    const { service } = await harness({
      lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
      priceError: new Error('price down'),
      adminEmail: 'ops@lattiz.app',
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'renewed');
    assert.equal(
      errors.some((line) => line.includes('renewal_over_cap')),
      false,
    );
  });

  it('says the domain was already expired when renewal fails after the expiry', async () => {
    const { service, adminMails } = await harness({
      cycles: [stored({ attempts: 4, expires_at: new Date(NOW.getTime() - DAY) })],
      lifecycles: [
        life('pending', null),
        life('expired', new Date(NOW.getTime() - DAY)),
      ],
      adminEmail: 'ops@lattiz.app',
    });
    assert.equal(await service.fulfil(CYCLE, NOW), 'failed');
    assert.equal(adminMails[0]?.key, `admin:renewal_failed:${CYCLE}`);
    const data = adminMails[0]?.data;
    assert.match(String(data?.summary), /ya estaba vencido/);
    assert.match(String(data?.summary), /reembolsar/);
    const details = data?.details as Record<string, unknown>;
    assert.equal(details.estado_registrador, 'expired');
  });
});

describe('DomainRenewalPaymentService retryPaid', () => {
  it('keeps going when one paid cycle fails', async () => {
    const { service, cycles, renewedCalls } = await harness({
      cycles: [
        stored({ id: CYCLE }),
        stored({
          id: CYCLE_B,
          domain_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          domain: 'bar.mx',
          registrar_domain_id: 'op-2',
        }),
      ],
      failClaimIds: [CYCLE],
      lifecycles: [life('active', EXPIRES), life('active', RENEWED)],
    });
    assert.equal(await service.retryPaid(NOW), 1);
    assert.equal(cycles.get(CYCLE)?.status, 'paid');
    assert.equal(cycles.get(CYCLE_B)?.status, 'renewed');
    assert.equal(renewedCalls.length, 1);
    assert.ok(errors.some((line) => line.includes('claim exploded')));
  });

  it('does not query when the scheduled retry is disabled, and a run failure does not escape', async () => {
    const disabled = await harness({ enabled: false });
    await disabled.service.retryPaidScheduled();
    assert.equal(disabled.calls.length, 0);

    let release: () => void = () => {};
    const holdList = new Promise<void>((resolve) => {
      release = resolve;
    });
    const held = await harness({ holdList, cycles: [] });
    const first = held.service.retryPaidScheduled();
    const second = held.service.retryPaidScheduled();
    await second;
    assert.equal(held.of('list-paid').length, 1);
    release();
    await first;

    const broken = await harness({ listError: new Error('db down') });
    await assert.doesNotReject(() => broken.service.retryPaidScheduled());
    assert.ok(errors.some((line) => line.includes('Paid retry run failed')));
  });
});

describe('DomainRenewalPaymentService getStatusForUser', () => {
  it('returns null when renewal is disabled, before any lookup', async () => {
    const { service, calls, cycleLookups } = await harness({
      enabled: false,
      cycle: cycleView(),
    });
    assert.equal(await service.getStatusForUser(USER), null);
    assert.equal(calls.length, 0);
    assert.equal(cycleLookups(), 0);
  });

  it('returns null without a tenant or without a live cycle', async () => {
    const missing = await harness({ tenant: null, cycle: cycleView() });
    assert.equal(await missing.service.getStatusForUser(USER), null);
    assert.equal(missing.cycleLookups(), 0);

    const idle = await harness({ cycle: null });
    assert.equal(await idle.service.getStatusForUser(USER), null);
    assert.equal(idle.cycleLookups(), 1);
  });

  it('can pay an open or overdue cycle inside the window with an active subscription', async () => {
    for (const status of ['open', 'overdue'] as const) {
      const { service } = await harness({
        cycle: cycleView({
          status,
          lateDeadlineAt:
            status === 'open' ? null : new Date(Date.now() + 10 * DAY),
        }),
      });
      const body = await service.getStatusForUser(USER);
      assert.ok(body);
      assert.equal(body.status, status);
      assert.equal(body.canPay, true);
      assert.equal(body.payBlockedReason, null);
      assert.equal(body.domain, 'cafe.mx');
      assert.equal(body.expiresAt, EXPIRES.toISOString());
      assert.equal(body.baseCents, 59900);
      assert.equal(body.taxCents, 9584);
      assert.equal(body.totalCents, 69484);
      assert.equal(body.currency, 'mxn');
    }
  });

  it('blocks payment when the window is closed, ahead of the subscription check', async () => {
    const closed = new Date(Date.now() - 1000);
    for (const tenant of [
      entitledTenant(),
      entitledTenant({ stripe_customer_id: null }),
    ]) {
      const { service } = await harness({
        tenant,
        cycle: cycleView({ status: 'overdue', lateDeadlineAt: closed }),
      });
      const body = await service.getStatusForUser(USER);
      assert.ok(body);
      assert.equal(body.canPay, false);
      assert.equal(body.payBlockedReason, 'window_closed');
      assert.equal(body.lateDeadlineAt, closed.toISOString());
    }
  });

  it('blocks payment when the subscription is not active and the window is still open', async () => {
    const tenants = [
      entitledTenant({ stripe_customer_id: null }),
      entitledTenant({ status: 'canceled' }),
      entitledTenant({ current_period_end: new Date(Date.now() - 1000) }),
      entitledTenant({ status: null, current_period_end: null }),
    ];
    for (const tenant of tenants) {
      const { service } = await harness({
        tenant,
        cycle: cycleView({ lateDeadlineAt: new Date(Date.now() + DAY) }),
      });
      const body = await service.getStatusForUser(USER);
      assert.ok(body);
      assert.equal(body.canPay, false);
      assert.equal(body.payBlockedReason, 'subscription_inactive');
    }
  });

  it('reports a paid or failed renewal as not payable without a block reason', async () => {
    for (const status of ['paid', 'renewal_failed'] as const) {
      const { service } = await harness({
        tenant: entitledTenant({ stripe_customer_id: null }),
        cycle: cycleView({
          status,
          lateDeadlineAt: new Date(Date.now() - DAY),
        }),
      });
      const body = await service.getStatusForUser(USER);
      assert.ok(body);
      assert.equal(body.status, status);
      assert.equal(body.canPay, false);
      assert.equal(body.payBlockedReason, null);
    }
  });
});
