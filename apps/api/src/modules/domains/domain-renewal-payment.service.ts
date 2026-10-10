import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { sql, type SQL } from 'drizzle-orm';
import Stripe from 'stripe';
import { computeIsEntitled } from '../../common/billing/entitlement';
import { type Database, DATABASE } from '../../database/database.module';
import { AdminAlertService } from '../email/application/admin-alert.service';
import { EmailOutboxService } from '../email/application/email-outbox.service';
import { STRIPE_CLIENT } from '../billing/stripe.provider';
import { DomainRenewalConfig } from './domain-renewal.config';
import {
  DomainRenewalService,
  type RenewalCycleView,
} from './domain-renewal.service';
import { RENEWAL_DAY_MS } from './domain/domain-renewal.policy';
import {
  DOMAIN_PRICE_CAPS,
  type DomainPriceCaps,
  resolveRenewalCapUsdCents,
} from './domain/domain-pricing.policy';
import { REGISTRAR_PORT, type RegistrarPort } from './domain/registrar.port';
import {
  DomainsTenantNotFoundException,
  RegistrarDomainNotActiveException,
  RenewalAlreadyPaidException,
  RenewalNotDueException,
  RenewalRequiresActiveSubscriptionException,
  RenewalWindowClosedException,
} from './domains.exceptions';
import { DomainsService } from './domains.service';
import type {
  DomainRenewalPayBlockedReason,
  DomainRenewalStatusDto,
  DomainRenewalStatusValue,
} from './dto/domains.response.dto';

/** A renewal adds a year; 300 days separates that from a same-day registrar correction. */
const ALREADY_RENEWED_AFTER_DAYS = 300;
/** Webhook and cron must not renew the same paid cycle at the same time. */
const CLAIM_LEASE_MS = 10 * 60 * 1000;
const CHECKOUT_TTL_SECONDS = 30 * 60;
const RETRY_BATCH = 20;

export type RenewalFulfilResult = 'renewed' | 'retry' | 'failed' | 'skipped';

interface TenantBillingRow {
  id: string;
  stripe_customer_id: string | null;
  status: string | null;
  current_period_end: string | Date | null;
}

interface ClaimRow {
  tenant_id: string;
  domain_id: string;
  domain: string;
  registrar_domain_id: string | null;
  expires_at: string | Date;
  attempts: number | string;
  stripe_payment_intent_id: string | null;
  amount_cents?: number | string | null;
  base_amount_cents?: number | string | null;
  tax_amount_cents?: number | string | null;
  currency?: string | null;
  plan?: string | null;
}

interface ClaimedCycle {
  cycleId: string;
  tenantId: string;
  domainId: string;
  domain: string;
  registrarDomainId: string | null;
  expiresAt: Date;
  paymentIntentId: string | null;
  plan: string | null;
  baseCents: number;
  taxCents: number;
  totalCents: number | null;
  currency: string;
}

interface CyclePaymentRow {
  status: string;
  stripe_payment_intent_id: string | null;
  tenant_id: string;
}

interface FailureRow {
  attempts: number | string;
  status: string;
}

interface RegistrarRenewal {
  renewalDate: Date;
  costUsdCents: number | null;
  restored: boolean;
}

/** Checkout for a frozen renewal cycle, then a single registrar renewal after payment. */
@Injectable()
export class DomainRenewalPaymentService {
  private readonly logger = new Logger(DomainRenewalPaymentService.name);
  private running = false;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    @Inject(REGISTRAR_PORT) private readonly registrar: RegistrarPort,
    private readonly config: DomainRenewalConfig,
    private readonly renewals: DomainRenewalService,
    private readonly domains: DomainsService,
    private readonly emails: EmailOutboxService,
    private readonly adminAlerts: AdminAlertService,
    @Inject(DOMAIN_PRICE_CAPS) private readonly caps: DomainPriceCaps,
  ) {}

  /** Offset from the hourly cycle cron so the two passes do not run together. */
  @Cron('30 * * * *')
  async retryPaidScheduled(): Promise<void> {
    if (!this.config.enabled || this.running) return;
    this.running = true;
    try {
      const renewed = await this.retryPaid(new Date());
      this.logger.log(`[domain-renewal] paid retries renewed=${renewed}`);
    } catch (err) {
      this.logger.error(
        `[domain-renewal] Paid retry run failed: ${errorText(err)}`,
      );
    } finally {
      this.running = false;
    }
  }

  async createCheckout(
    userSub: string,
    appUrl: string,
  ): Promise<{ url: string }> {
    if (!this.config.enabled) throw new RenewalNotDueException();

    const now = new Date();
    const tenant = await this.loadTenant(userSub);
    if (!tenant) throw new DomainsTenantNotFoundException();

    const cycle = await this.renewals.findActiveCycleForTenant(tenant.id);
    this.assertPayable(cycle, tenant, now);
    const customerId = tenant.stripe_customer_id;
    if (!customerId) throw new RenewalRequiresActiveSubscriptionException();

    const metadata: Stripe.MetadataParam = {
      kind: 'domain_renewal',
      cycle_id: cycle.cycleId,
      tenant_id: cycle.tenantId,
      domain_id: cycle.domainId,
    };
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems(cycle),
      metadata,
      payment_intent_data: { metadata },
      success_url: `${appUrl}/dashboard/domain?renewal=success`,
      cancel_url: `${appUrl}/dashboard/domain?renewal=canceled`,
      expires_at: Math.floor(now.getTime() / 1000) + CHECKOUT_TTL_SECONDS,
    });
    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url };
  }

  /** Live cycle for the caller's tenant, or null when renewal is off or nothing is due. */
  async getStatusForUser(
    userSub: string,
  ): Promise<DomainRenewalStatusDto | null> {
    if (!this.config.enabled) return null;

    const tenant = await this.loadTenant(userSub);
    if (!tenant) return null;

    const cycle = await this.renewals.findActiveCycleForTenant(tenant.id);
    if (!cycle || !isVisibleRenewalStatus(cycle.status)) return null;

    const pay = this.payability(cycle, tenant, new Date());
    return {
      domain: cycle.domain,
      status: cycle.status,
      expiresAt: cycle.expiresAt.toISOString(),
      lateDeadlineAt: cycle.lateDeadlineAt
        ? cycle.lateDeadlineAt.toISOString()
        : null,
      baseCents: cycle.baseCents,
      taxCents: cycle.taxCents,
      totalCents: cycle.totalCents,
      currency: cycle.currency,
      canPay: pay.canPay,
      payBlockedReason: pay.payBlockedReason,
    };
  }

  async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    if (
      session.metadata?.kind !== 'domain_renewal' ||
      session.payment_status !== 'paid'
    ) {
      this.logger.log(
        `[domain-renewal] Ignoring checkout session ${session.id} (kind=${session.metadata?.kind ?? 'none'}, payment_status=${session.payment_status})`,
      );
      return;
    }

    const cycleId = session.metadata.cycle_id;
    const paymentIntentId = paymentIntentIdOf(session);
    if (!cycleId) {
      await this.alertUnpayable({
        cycleId: 'missing',
        tenantId: session.metadata.tenant_id ?? 'missing',
        paymentIntentId,
        sessionId: session.id,
        status: 'missing',
        amountCents: session.amount_total ?? null,
      });
      return;
    }

    const now = new Date();
    const updated = await this.query<{ id: string }>(
      sql`UPDATE public.domain_maintenance_cycles
          SET status = 'paid',
              paid_at = ${iso(now)}::timestamptz,
              stripe_checkout_session_id = ${session.id},
              stripe_payment_intent_id = ${paymentIntentId},
              attempts = 0,
              last_error = NULL
          WHERE id = ${cycleId}::uuid
            AND status IN ('open', 'overdue')
          RETURNING id`,
    );
    if (updated.length === 0) {
      await this.alertUnlessReplay(cycleId, session, paymentIntentId);
      return;
    }

    try {
      await this.fulfil(cycleId, now);
    } catch (err) {
      this.logger.error(
        `[domain-renewal] Fulfilment failed for cycle ${cycleId}; the retry cron will try again: ${errorText(err)}`,
      );
    }
  }

  async fulfil(
    cycleId: string,
    now = new Date(),
  ): Promise<RenewalFulfilResult> {
    const claimed = await this.claim(cycleId, now);
    if (!claimed) return 'skipped';

    let outcome: RegistrarRenewal | undefined;
    try {
      outcome = await this.renewAtRegistrar(claimed);
      const marked = await this.markRenewed(claimed, outcome, now);
      if (!marked) {
        this.logger.error(
          `[domain-renewal] Cycle ${cycleId} renewed at the registrar but the row was no longer paid`,
        );
        return 'skipped';
      }
    } catch (err) {
      return this.recordFailure(claimed, err, now);
    }

    if (!outcome) return 'skipped';
    await this.notifyRenewed(claimed, outcome, now);
    if (outcome.restored) await this.redelegate(claimed);
    return 'renewed';
  }

  async retryPaid(now = new Date()): Promise<number> {
    const rows = await this.query<{ id: string }>(
      sql`SELECT id
          FROM public.domain_maintenance_cycles
          WHERE status = 'paid'
          ORDER BY paid_at ASC NULLS LAST, id
          LIMIT ${RETRY_BATCH}`,
    );
    let renewed = 0;
    for (const row of rows) {
      try {
        const result = await this.fulfil(row.id, now);
        if (result === 'renewed') renewed += 1;
      } catch (err) {
        this.logger.error(
          `[domain-renewal] Paid retry failed for cycle ${row.id}: ${errorText(err)}`,
        );
      }
    }
    return renewed;
  }

  private assertPayable(
    cycle: RenewalCycleView | null,
    tenant: TenantBillingRow,
    now: Date,
  ): asserts cycle is RenewalCycleView {
    if (!cycle) throw new RenewalNotDueException();
    if (cycle.status === 'paid' || cycle.status === 'renewal_failed') {
      throw new RenewalAlreadyPaidException();
    }
    if (
      cycle.status === 'overdue' &&
      cycle.lateDeadlineAt !== null &&
      cycle.lateDeadlineAt.getTime() <= now.getTime()
    ) {
      throw new RenewalWindowClosedException();
    }
    if (cycle.status !== 'open' && cycle.status !== 'overdue') {
      throw new RenewalNotDueException();
    }
    if (!this.hasActiveSubscription(tenant)) {
      throw new RenewalRequiresActiveSubscriptionException();
    }
  }

  private hasActiveSubscription(tenant: TenantBillingRow): boolean {
    return (
      Boolean(tenant.stripe_customer_id) &&
      computeIsEntitled({
        status: tenant.status,
        currentPeriodEnd: tenant.current_period_end,
      })
    );
  }

  private payability(
    cycle: RenewalCycleView,
    tenant: TenantBillingRow,
    now: Date,
  ): {
    canPay: boolean;
    payBlockedReason: DomainRenewalPayBlockedReason | null;
  } {
    if (cycle.status !== 'open' && cycle.status !== 'overdue') {
      return { canPay: false, payBlockedReason: null };
    }
    if (
      cycle.lateDeadlineAt !== null &&
      cycle.lateDeadlineAt.getTime() <= now.getTime()
    ) {
      return { canPay: false, payBlockedReason: 'window_closed' };
    }
    if (!this.hasActiveSubscription(tenant)) {
      return { canPay: false, payBlockedReason: 'subscription_inactive' };
    }
    return { canPay: true, payBlockedReason: null };
  }

  private async loadTenant(userSub: string): Promise<TenantBillingRow | null> {
    const rows = await this.query<TenantBillingRow>(
      sql`SELECT t.id, t.stripe_customer_id, s.status, s.current_period_end
          FROM public.tenants t
          LEFT JOIN public.subscriptions s ON s.tenant_id = t.id
          WHERE t.user_id = ${userSub}::uuid
          ORDER BY s.created_at DESC NULLS LAST
          LIMIT 1`,
    );
    return rows[0] ?? null;
  }

  private async alertUnlessReplay(
    cycleId: string,
    session: Stripe.Checkout.Session,
    paymentIntentId: string | null,
  ): Promise<void> {
    const rows = await this.query<CyclePaymentRow>(
      sql`SELECT status, stripe_payment_intent_id, tenant_id
          FROM public.domain_maintenance_cycles
          WHERE id = ${cycleId}::uuid
          LIMIT 1`,
    );
    const row = rows[0];
    if (paymentIntentId && row?.stripe_payment_intent_id === paymentIntentId) {
      return;
    }
    await this.alertUnpayable({
      cycleId,
      tenantId: row?.tenant_id ?? session.metadata?.tenant_id ?? 'missing',
      paymentIntentId,
      sessionId: session.id,
      status: row?.status ?? 'missing',
      amountCents: session.amount_total ?? null,
    });
  }

  private async alertUnpayable(details: {
    cycleId: string;
    tenantId: string;
    paymentIntentId: string | null;
    sessionId: string;
    status: string;
    amountCents: number | null;
  }): Promise<void> {
    const ref = details.paymentIntentId ?? details.sessionId;
    await this.adminAlerts.alert({
      key: `renewal_unpayable:${ref}`,
      title: 'Pago de renovación sin ciclo pagable',
      summary:
        'Llegó un pago de renovación sin un ciclo que se pueda cobrar. Hay que revisar el caso y reembolsar a mano.',
      details: {
        tenant: details.tenantId,
        ciclo: details.cycleId,
        estado: details.status,
        payment_intent: details.paymentIntentId,
        monto_sesion_centavos: details.amountCents,
      },
      tenantId: details.tenantId === 'missing' ? null : details.tenantId,
    });
  }

  private async claim(
    cycleId: string,
    now: Date,
  ): Promise<ClaimedCycle | null> {
    const claimBefore = new Date(now.getTime() - CLAIM_LEASE_MS);
    const rows = await this.query<ClaimRow>(
      sql`UPDATE public.domain_maintenance_cycles AS c
          SET renewal_attempt_started_at = ${iso(now)}::timestamptz
          FROM public.domains AS d, public.tenants AS t
          WHERE c.id = ${cycleId}::uuid
            AND d.id = c.domain_id
            AND t.id = c.tenant_id
            AND c.status = 'paid'
            AND (
              c.renewal_attempt_started_at IS NULL
              OR c.renewal_attempt_started_at < ${iso(claimBefore)}::timestamptz
            )
          RETURNING c.tenant_id, c.domain_id, c.expires_at, c.attempts,
                    c.stripe_payment_intent_id, c.amount_cents,
                    c.base_amount_cents, c.tax_amount_cents, c.currency,
                    d.registrar_domain_id, d.domain, t.plan`,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      cycleId,
      tenantId: row.tenant_id,
      domainId: row.domain_id,
      domain: row.domain,
      registrarDomainId: row.registrar_domain_id,
      expiresAt: asDate(row.expires_at),
      paymentIntentId: row.stripe_payment_intent_id,
      plan: row.plan ?? null,
      baseCents: cents(row.base_amount_cents) ?? 0,
      taxCents: cents(row.tax_amount_cents) ?? 0,
      totalCents: cents(row.amount_cents),
      currency: row.currency ?? 'mxn',
    };
  }

  private async renewAtRegistrar(
    claimed: ClaimedCycle,
  ): Promise<RegistrarRenewal> {
    const registrarDomainId = claimed.registrarDomainId;
    if (!registrarDomainId) throw new Error('Domain has no registrar id');

    const first = await this.registrar.getLifecycle(registrarDomainId);
    let cost: number | null = null;
    let restored = false;

    if (!isAlreadyRenewed(first.renewalDate, claimed.expiresAt)) {
      if (first.status === 'active') {
        cost = await this.bestEffortRenewalCost(claimed.domain);
        try {
          await this.registrar.renewDomain({
            registrarDomainId,
            domain: claimed.domain,
            periodYears: 1,
          });
        } catch (err) {
          if (!(err instanceof RegistrarDomainNotActiveException)) throw err;
          cost = await this.restoreAndRenewIfNeeded(
            claimed,
            registrarDomainId,
            cost,
          );
          restored = true;
        }
      } else if (first.status === 'expired') {
        cost = await this.restoreAndRenewIfNeeded(
          claimed,
          registrarDomainId,
          cost,
        );
        restored = true;
      } else {
        throw new Error(`Registrar status is ${first.status}`);
      }
    }

    const after = await this.registrar.getLifecycle(registrarDomainId);
    if (!isAlreadyRenewed(after.renewalDate, claimed.expiresAt)) {
      const reported = after.renewalDate ? iso(after.renewalDate) : 'none';
      throw new Error(
        `Registrar renewal date did not advance (cycle expires ${iso(claimed.expiresAt)}, reported ${reported})`,
      );
    }
    return { renewalDate: after.renewalDate, costUsdCents: cost, restored };
  }

  private async restoreAndRenewIfNeeded(
    claimed: ClaimedCycle,
    registrarDomainId: string,
    cost: number | null,
  ): Promise<number | null> {
    await this.registrar.restoreDomain({
      registrarDomainId,
      domain: claimed.domain,
    });
    const afterRestore = await this.registrar.getLifecycle(registrarDomainId);
    if (
      isAlreadyRenewed(afterRestore.renewalDate, claimed.expiresAt) ||
      afterRestore.status !== 'active'
    ) {
      return cost;
    }
    const priced = cost ?? (await this.bestEffortRenewalCost(claimed.domain));
    await this.registrar.renewDomain({
      registrarDomainId,
      domain: claimed.domain,
      periodYears: 1,
    });
    return priced;
  }

  private async bestEffortRenewalCost(domain: string): Promise<number | null> {
    try {
      return await this.registrar.getPriceUsdCents(domain, 'renew');
    } catch (err) {
      this.logger.warn(
        `[domain-renewal] Could not read the renewal cost of ${domain}: ${errorText(err)}`,
      );
      return null;
    }
  }

  private async markRenewed(
    claimed: ClaimedCycle,
    outcome: RegistrarRenewal,
    now: Date,
  ): Promise<boolean> {
    await this.query(
      sql`UPDATE public.domains
          SET expires_at = ${iso(outcome.renewalDate)}::timestamptz
          WHERE id = ${claimed.domainId}::uuid`,
    );
    const rows = await this.query<{ id: string }>(
      sql`UPDATE public.domain_maintenance_cycles
          SET status = 'renewed',
              renewed_at = ${iso(now)}::timestamptz,
              renewal_cost_usd_cents = ${outcome.costUsdCents},
              last_error = NULL
          WHERE id = ${claimed.cycleId}::uuid
            AND status = 'paid'
          RETURNING id`,
    );
    return rows.length > 0;
  }

  private async notifyRenewed(
    claimed: ClaimedCycle,
    outcome: RegistrarRenewal,
    now: Date,
  ): Promise<void> {
    const siteWasOffline = claimed.expiresAt.getTime() <= now.getTime();
    await this.emails.enqueueForTenant(
      'domain_renewed',
      claimed.tenantId,
      {
        domain: claimed.domain,
        expiresAt: outcome.renewalDate.toISOString(),
        lateDeadlineAt: null,
        daysLeft: 0,
        baseCents: claimed.baseCents,
        taxCents: claimed.taxCents,
        totalCents: claimed.totalCents ?? 0,
        currency: claimed.currency,
        subscriptionActive: true,
        siteWasOffline,
      },
      `renewal:${claimed.cycleId}:renewed`,
    );
    if (outcome.costUsdCents === null) return;
    const capUsdCents = resolveRenewalCapUsdCents(claimed.plan, this.caps);
    if (outcome.costUsdCents <= capUsdCents) return;
    await this.adminAlerts.alert({
      key: `renewal_over_cap:${claimed.cycleId}`,
      title: 'La renovación superó el tope del plan',
      summary:
        'El costo real de renovación supera el tope del plan. La renovación se completó de todas formas; es solo un aviso.',
      details: {
        dominio: claimed.domain,
        plan: claimed.plan,
        costo_usd_centavos: outcome.costUsdCents,
        tope_usd_centavos: capUsdCents,
      },
      tenantId: claimed.tenantId,
    });
  }

  private async recordFailure(
    claimed: ClaimedCycle,
    err: unknown,
    now: Date,
  ): Promise<'retry' | 'failed' | 'skipped'> {
    const message = errorText(err);
    const rows = await this.query<FailureRow>(
      sql`UPDATE public.domain_maintenance_cycles
          SET attempts = attempts + 1,
              last_error = ${message},
              status = CASE
                WHEN attempts + 1 >= ${this.config.maxRegistrarAttempts}
                  THEN 'renewal_failed'
                ELSE status
              END
          WHERE id = ${claimed.cycleId}::uuid
            AND status = 'paid'
          RETURNING attempts, status`,
    );
    const row = rows[0];
    if (!row) return 'skipped';
    if (row.status !== 'renewal_failed') return 'retry';
    const registrar = await this.readRegistrar(claimed);
    const expired = claimed.expiresAt.getTime() <= now.getTime();
    const summary = expired
      ? 'La renovación en el registrador falló después del pago. Hay que renovar a mano en Openprovider o reembolsar. El dominio ya estaba vencido: puede ser que Openprovider ya no permita recuperarlo a precio normal.'
      : 'La renovación en el registrador falló después del pago. Hay que renovar a mano en Openprovider o reembolsar.';
    const attempts = Number(row.attempts);
    await this.adminAlerts.alert({
      key: `renewal_failed:${claimed.cycleId}`,
      title: 'Renovación de dominio fallida tras el pago',
      summary,
      details: {
        tenant: claimed.tenantId,
        dominio: claimed.domain,
        ciclo: claimed.cycleId,
        payment_intent: claimed.paymentIntentId,
        monto_pagado_centavos: claimed.totalCents,
        intentos: Number.isFinite(attempts) ? attempts : null,
        ultimo_error: message,
        ...(registrar
          ? {
              estado_registrador: registrar.status,
              fecha_registrador: registrar.renewalDate
                ? iso(registrar.renewalDate)
                : null,
            }
          : {}),
      },
      tenantId: claimed.tenantId,
    });
    return 'failed';
  }

  private async readRegistrar(
    claimed: ClaimedCycle,
  ): Promise<{ status: string; renewalDate: Date | null } | null> {
    if (!claimed.registrarDomainId) return null;
    try {
      const life = await this.registrar.getLifecycle(claimed.registrarDomainId);
      return { status: life.status, renewalDate: life.renewalDate };
    } catch {
      return null;
    }
  }

  private async redelegate(claimed: ClaimedCycle): Promise<void> {
    try {
      await this.domains.redelegateAfterRestore(claimed.tenantId);
    } catch (err) {
      await this.adminAlerts.alert({
        key: `renewal_dns:${claimed.cycleId}`,
        title: 'Falló la redelegación DNS tras renovar',
        summary:
          'El dominio se renovó después de restaurarlo, pero la redelegación DNS falló. Hay que redelegar a mano.',
        details: {
          tenant: claimed.tenantId,
          dominio: claimed.domain,
          error: errorText(err),
        },
        tenantId: claimed.tenantId,
      });
    }
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function isVisibleRenewalStatus(
  status: RenewalCycleView['status'],
): status is DomainRenewalStatusValue {
  return (
    status === 'open' ||
    status === 'overdue' ||
    status === 'paid' ||
    status === 'renewal_failed'
  );
}

function lineItems(
  cycle: RenewalCycleView,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: 'mxn',
        unit_amount: cycle.baseCents,
        product_data: {
          name: `Renovación anual del dominio ${cycle.domain}`,
        },
      },
    },
  ];
  if (cycle.taxCents > 0) {
    items.push({
      quantity: 1,
      price_data: {
        currency: 'mxn',
        unit_amount: cycle.taxCents,
        product_data: { name: 'IVA' },
      },
    });
  }
  return items;
}

function isAlreadyRenewed(
  renewalDate: Date | null,
  cycleExpiresAt: Date,
): renewalDate is Date {
  if (renewalDate === null) return false;
  return (
    renewalDate.getTime() >
    cycleExpiresAt.getTime() + ALREADY_RENEWED_AFTER_DAYS * RENEWAL_DAY_MS
  );
}

function paymentIntentIdOf(session: Stripe.Checkout.Session): string | null {
  const intent = session.payment_intent;
  if (!intent) return null;
  return typeof intent === 'string' ? intent : intent.id;
}

function asDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function cents(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function errorText(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return message.slice(0, 500);
}

/** postgres.js rejects a Date bound in raw sql; bind ISO text and cast. */
function iso(value: Date): string {
  return value.toISOString();
}
