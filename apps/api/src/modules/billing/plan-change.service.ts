import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import Stripe from 'stripe';
import { type Database, DATABASE } from '../../database/database.module';
import { DomainsService } from '../domains/domains.service';
import { TemplateAccessService } from '../templates/template-access.service';
import {
  type BillingPeriod,
  type BillingPlan,
  lookupKeyFor,
} from './billing.constants';
import {
  BillingProviderUnavailableException,
  BillingTenantAccessDeniedException,
  BillingTenantNotFoundException,
  NoPendingPlanChangeException,
  PlanChangeFailedException,
  PlanChangeNotAllowedException,
  PlanChangeImpactNotAcknowledgedException,
  PlanChangeNotConfiguredException,
  PriceNotConfiguredException,
  SubscriptionOwnershipMismatchException,
} from './billing.exceptions';
import type {
  PlanChangeImpactResponseDto,
  PlanChangeOptionDto,
  PlanChangeResultDto,
  PlanChangeStatusResponseDto,
} from './dto/plan-change.dto';
import {
  type PlanChangeImpactItem,
  templateLossImpact,
} from './plan-change-impact';
import {
  buildDowngradeScheduleUpdate,
  type ScheduleState,
} from './plan-change-schedule';
import {
  type DomainRenewalCheck,
  evaluatePlanChange,
  planChangeDirection,
  type PlanChangeSnapshot,
} from './plan-change.policy';
import { STRIPE_CLIENT } from './stripe.provider';
import { SubscriptionStateService } from './subscription-state.service';

const TARGET_PLANS: BillingPlan[] = ['basico', 'pro'];
// Latin American Spanish, the closest Stripe locale for Mexican customers.
const PORTAL_LOCALE = 'es-419';

interface PlanChangeContext {
  tenantId: string;
  subscription: Stripe.Subscription | null;
  snapshot: PlanChangeSnapshot;
  schedule: ScheduleState;
}

/**
 * Upgrades go through a Stripe portal flow (Stripe shows the proration and
 * handles payment); downgrades are scheduled by us for the period end, because
 * the portal can only defer changes between prices of the same product.
 * `tenants.plan` is never written here: the webhook sync does that from Stripe.
 */
@Injectable()
export class PlanChangeService {
  private readonly logger = new Logger(PlanChangeService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: SubscriptionStateService,
    private readonly domains: DomainsService,
    private readonly templateAccess: TemplateAccessService,
  ) {}

  /** What moving to `target` would take away from the tenant; read-only. */
  async getImpact(
    userSub: string,
    tenantId: string,
    target: BillingPlan,
  ): Promise<PlanChangeImpactResponseDto> {
    await this.assertOwnTenant(userSub, tenantId);
    const ctx = await this.load(userSub);
    return { target, items: await this.impactItems(ctx, target) };
  }

  async getStatus(userSub: string): Promise<PlanChangeStatusResponseDto> {
    const ctx = await this.load(userSub);
    const periodEnd = currentPeriodEnd(ctx.subscription);
    const options: PlanChangeOptionDto[] = [];
    for (const targetPlan of TARGET_PLANS) {
      const domainCheck = await this.domainCheckFor(ctx, targetPlan);
      const evaluation = evaluatePlanChange(
        ctx.snapshot,
        targetPlan,
        domainCheck,
      );
      options.push({
        targetPlan,
        direction: evaluation.direction,
        effective: evaluation.timing,
        effectiveAt:
          evaluation.timing === 'period_end' && periodEnd
            ? toIso(periodEnd)
            : null,
        allowed: evaluation.blockers.length === 0,
        blockers: evaluation.blockers,
      });
    }
    return {
      currentPlan: ctx.snapshot.currentPlan,
      billingPeriod: ctx.snapshot.period,
      pending:
        ctx.schedule.kind === 'pending'
          ? {
              targetPlan: ctx.schedule.targetPlan,
              effectiveAt: toIso(ctx.schedule.effectiveAt),
            }
          : null,
      options,
    };
  }

  async requestChange(
    userSub: string,
    targetPlan: BillingPlan,
    appUrl: string,
    acknowledgeLosses = false,
  ): Promise<PlanChangeResultDto> {
    let ctx = await this.load(userSub);
    if (ctx.schedule.kind === 'finished') {
      await this.state.releaseSchedule(ctx.schedule.scheduleId);
      ctx = await this.load(userSub);
    }
    // A repeated downgrade request returns the change already scheduled.
    if (
      ctx.schedule.kind === 'pending' &&
      ctx.schedule.targetPlan === targetPlan
    ) {
      return scheduled(ctx.schedule.effectiveAt);
    }

    const evaluation = evaluatePlanChange(
      ctx.snapshot,
      targetPlan,
      await this.domainCheckFor(ctx, targetPlan),
    );
    const { subscription } = ctx;
    const period = ctx.snapshot.period;
    if (evaluation.blockers.length > 0 || !subscription || !period) {
      throw new PlanChangeNotAllowedException(evaluation.blockers);
    }

    if (evaluation.direction === 'upgrade') {
      return this.startUpgrade(subscription, targetPlan, period, appUrl);
    }
    // A downgrade that loses something needs an explicit acknowledgement first.
    const losses = await this.impactItems(ctx, targetPlan);
    if (losses.length > 0 && !acknowledgeLosses) {
      throw new PlanChangeImpactNotAcknowledgedException(losses);
    }
    if (losses.length > 0) {
      this.logger.log(
        `[plan-change] Tenant ${ctx.tenantId} acknowledged: ${losses.map((l) => `${l.kind}:${l.templateId}`).join(', ')}`,
      );
    }
    return this.scheduleDowngrade(
      userSub,
      ctx.tenantId,
      subscription,
      targetPlan,
      period,
    );
  }

  async releasePending(userSub: string): Promise<{ released: boolean }> {
    const ctx = await this.load(userSub);
    if (ctx.schedule.kind !== 'pending')
      throw new NoPendingPlanChangeException();
    try {
      await this.state.releaseSchedule(ctx.schedule.scheduleId);
    } catch (err) {
      this.logger.error(
        `[plan-change] Could not release schedule ${ctx.schedule.scheduleId} for tenant ${ctx.tenantId}: ${describe(err)}`,
      );
      throw new BillingProviderUnavailableException();
    }
    this.logger.log(
      `[plan-change] Tenant ${ctx.tenantId} canceled its scheduled change (${ctx.schedule.scheduleId})`,
    );
    return { released: true };
  }

  // ── Upgrade: Stripe portal flow ───────────────────────────────────────────
  private async startUpgrade(
    subscription: Stripe.Subscription,
    targetPlan: BillingPlan,
    period: BillingPeriod,
    appUrl: string,
  ): Promise<PlanChangeResultDto> {
    const configuration =
      process.env.STRIPE_PORTAL_CONFIGURATION_PLAN_CHANGE?.trim();
    if (!configuration) throw new PlanChangeNotConfiguredException();

    const price = await this.findActivePrice(targetPlan, period);
    const item = subscription.items.data[0];
    let session: Stripe.BillingPortal.Session;
    try {
      session = await this.stripe.billingPortal.sessions.create({
        customer: customerId(subscription),
        configuration,
        locale: PORTAL_LOCALE,
        return_url: `${appUrl}/dashboard/subscription?plan_change=canceled`,
        flow_data: {
          type: 'subscription_update_confirm',
          subscription_update_confirm: {
            subscription: subscription.id,
            items: [
              { id: item.id, price: price.id, quantity: item.quantity ?? 1 },
            ],
          },
          after_completion: {
            type: 'redirect',
            redirect: {
              return_url: `${appUrl}/dashboard/subscription?plan_change=done`,
            },
          },
        },
      });
    } catch (err) {
      this.logger.error(
        `[plan-change] Portal flow failed for ${subscription.id}: ${describe(err)}`,
      );
      throw new BillingProviderUnavailableException();
    }
    this.logger.log(
      `[plan-change] Upgrade flow opened for ${subscription.id} → ${targetPlan}`,
    );
    return { kind: 'redirect', url: session.url, effectiveAt: null };
  }

  // ── Downgrade: our own subscription schedule ──────────────────────────────
  private async scheduleDowngrade(
    userSub: string,
    tenantId: string,
    subscription: Stripe.Subscription,
    targetPlan: BillingPlan,
    period: BillingPeriod,
  ): Promise<PlanChangeResultDto> {
    const periodEnd = currentPeriodEnd(subscription);
    if (!periodEnd)
      throw new PlanChangeNotAllowedException(['UNSUPPORTED_SUBSCRIPTION']);
    const price = await this.findActivePrice(targetPlan, period);

    let schedule: Stripe.SubscriptionSchedule;
    try {
      // billing_mode is inherited from the subscription; passing it here is rejected.
      schedule = await this.stripe.subscriptionSchedules.create({
        from_subscription: subscription.id,
      });
    } catch (err) {
      // A concurrent request may have scheduled the same change first.
      const again = await this.load(userSub);
      if (
        again.schedule.kind === 'pending' &&
        again.schedule.targetPlan === targetPlan
      ) {
        return scheduled(again.schedule.effectiveAt);
      }
      this.logger.error(
        `[plan-change] Schedule creation failed for ${subscription.id}: ${describe(err)}`,
      );
      throw new PlanChangeFailedException();
    }

    try {
      await this.stripe.subscriptionSchedules.update(
        schedule.id,
        buildDowngradeScheduleUpdate({
          currentPhase: schedule.phases[0],
          periodEnd,
          targetPriceId: price.id,
          targetPlan,
          subscriptionMetadata: subscription.metadata,
        }),
      );
    } catch (err) {
      this.logger.error(
        `[plan-change] Schedule ${schedule.id} update failed for ${subscription.id}; releasing it: ${describe(err)}`,
      );
      await this.releaseQuietly(schedule.id, tenantId);
      throw new PlanChangeFailedException();
    }

    this.logger.log(
      `[plan-change] Tenant ${tenantId} scheduled ${targetPlan} on ${toIso(periodEnd)} (${schedule.id})`,
    );
    return scheduled(periodEnd);
  }

  private async releaseQuietly(
    scheduleId: string,
    tenantId: string,
  ): Promise<void> {
    try {
      await this.state.releaseSchedule(scheduleId);
    } catch (err) {
      this.logger.error(
        `[ADMIN_ALERT] plan-change schedule ${scheduleId} (tenant ${tenantId}) is half-configured and could not be released: ${describe(err)}`,
      );
    }
  }

  // ── Impact ────────────────────────────────────────────────────────────────
  /** Only a downgrade loses anything; the date is when it takes effect (A1: period end). */
  private async impactItems(
    ctx: PlanChangeContext,
    target: BillingPlan,
  ): Promise<PlanChangeImpactItem[]> {
    const evaluation = evaluatePlanChange(ctx.snapshot, target, 'ok');
    if (evaluation.direction !== 'downgrade') return [];
    const periodEnd = currentPeriodEnd(ctx.subscription);
    const effectiveAt =
      ctx.schedule.kind === 'pending' && ctx.schedule.targetPlan === target
        ? toIso(ctx.schedule.effectiveAt)
        : evaluation.timing === 'period_end'
          ? periodEnd
            ? toIso(periodEnd)
            : null
          : new Date().toISOString();
    const state = await this.templateAccess.stateForTenant(ctx.tenantId);
    const loss = templateLossImpact(state.current, target, effectiveAt);
    return loss ? [loss] : [];
  }

  private async assertOwnTenant(
    userSub: string,
    tenantId: string,
  ): Promise<void> {
    const rows = await this.query<{ ok: number }>(
      sql`SELECT 1 AS ok FROM public.tenants
          WHERE id = ${tenantId}::uuid AND user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    if (!rows[0]) throw new BillingTenantAccessDeniedException();
  }

  // ── Context ───────────────────────────────────────────────────────────────
  /** Tenant from the JWT, subscription from our DB, state from Stripe; ownership checked against Stripe. */
  private async load(userSub: string): Promise<PlanChangeContext> {
    const tenants = await this.query<{
      id: string;
      stripe_customer_id: string | null;
    }>(
      sql`SELECT id, stripe_customer_id FROM public.tenants
          WHERE user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    const tenant = tenants[0];
    if (!tenant) throw new BillingTenantNotFoundException();

    const rows = await this.query<{ stripe_subscription_id: string }>(
      sql`SELECT stripe_subscription_id FROM public.subscriptions
          WHERE tenant_id = ${tenant.id}::uuid
          ORDER BY created_at DESC
          LIMIT 1`,
    );
    const subscriptionId = rows[0]?.stripe_subscription_id;
    if (!subscriptionId || !tenant.stripe_customer_id) {
      return noSubscription(tenant.id);
    }

    let subscription: Stripe.Subscription;
    let schedule: ScheduleState;
    let resolved: Awaited<ReturnType<SubscriptionStateService['resolvePlan']>>;
    try {
      subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      resolved = await this.state.resolvePlan(subscription);
      schedule = await this.state.readSchedule(
        subscription,
        resolved?.plan ?? null,
      );
    } catch (err) {
      this.logger.error(
        `[plan-change] Stripe read failed for ${subscriptionId}: ${describe(err)}`,
      );
      throw new BillingProviderUnavailableException();
    }

    if (customerId(subscription) !== tenant.stripe_customer_id) {
      this.logger.error(
        `[ADMIN_ALERT] subscription ${subscription.id} belongs to ${customerId(subscription)}, not tenant ${tenant.id}'s customer ${tenant.stripe_customer_id}`,
      );
      throw new SubscriptionOwnershipMismatchException();
    }

    return {
      tenantId: tenant.id,
      subscription,
      schedule,
      snapshot: {
        status: subscription.status,
        canceling:
          subscription.cancel_at != null ||
          subscription.cancel_at_period_end === true,
        itemCount: subscription.items.data.length,
        currentPlan: resolved?.plan ?? null,
        period: resolved?.period ?? null,
        schedule:
          schedule.kind === 'pending'
            ? 'pending'
            : schedule.kind === 'foreign'
              ? 'foreign'
              : 'none',
      },
    };
  }

  /** Only a downgrade looks at domains; failures fail closed as `price_unavailable`. */
  private async domainCheckFor(
    ctx: PlanChangeContext,
    targetPlan: BillingPlan,
  ): Promise<DomainRenewalCheck | null> {
    if (
      planChangeDirection(ctx.snapshot.currentPlan, targetPlan) !== 'downgrade'
    ) {
      return null;
    }
    try {
      return await this.domains.checkManagedDomainRenewal(
        ctx.tenantId,
        targetPlan,
      );
    } catch (err) {
      this.logger.warn(
        `[plan-change] Domain renewal check failed for tenant ${ctx.tenantId}: ${describe(err)}`,
      );
      return 'price_unavailable';
    }
  }

  private async findActivePrice(
    plan: BillingPlan,
    period: BillingPeriod,
  ): Promise<Stripe.Price> {
    const lookupKey = lookupKeyFor(plan, period);
    let prices: Stripe.ApiList<Stripe.Price>;
    try {
      prices = await this.stripe.prices.list({
        lookup_keys: [lookupKey],
        active: true,
        limit: 1,
      });
    } catch (err) {
      this.logger.error(`[plan-change] Price lookup failed: ${describe(err)}`);
      throw new BillingProviderUnavailableException();
    }
    const price = prices.data[0];
    if (!price) throw new PriceNotConfiguredException(lookupKey);
    return price;
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    return (await this.db.execute(statement)) as unknown as T[];
  }
}

function noSubscription(tenantId: string): PlanChangeContext {
  return {
    tenantId,
    subscription: null,
    schedule: { kind: 'none' },
    snapshot: {
      status: null,
      canceling: false,
      itemCount: 0,
      currentPlan: null,
      period: null,
      schedule: 'none',
    },
  };
}

function scheduled(effectiveAt: number): PlanChangeResultDto {
  return { kind: 'scheduled', url: null, effectiveAt: toIso(effectiveAt) };
}

/** Flexible billing mode keeps the period on the item, not the subscription. */
function currentPeriodEnd(
  subscription: Stripe.Subscription | null,
): number | null {
  return subscription?.items.data[0]?.current_period_end ?? null;
}

function customerId(subscription: Stripe.Subscription): string {
  return typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;
}

function toIso(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
