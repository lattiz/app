import type Stripe from 'stripe';
import type { BillingPlan } from './billing.constants';

/** Marks the schedules our API creates, so we never release or report someone else's. */
export const PLAN_CHANGE_SCHEDULE_METADATA = {
  app: 'lattiz',
  purpose: 'plan_change',
} as const;

const LIVE_SCHEDULE_STATUSES = new Set(['not_started', 'active']);

export type ScheduleState =
  | { kind: 'none' }
  /** Ours, with a future phase on another plan. */
  | {
      kind: 'pending';
      scheduleId: string;
      targetPlan: BillingPlan;
      effectiveAt: number;
    }
  /** Ours, with no future phase left: the change already happened and the schedule should be released. */
  | { kind: 'finished'; scheduleId: string }
  /** Not ours or not understood; `futurePlan` is still reported so callers can fail closed. */
  | {
      kind: 'foreign';
      scheduleId: string;
      futurePlan: BillingPlan | null;
      effectiveAt: number | null;
    };

/**
 * `resolvePrice` maps a phase item's price (id or expanded object) to a plan.
 * `now` is unix seconds.
 */
export function classifySchedule(
  schedule: Stripe.SubscriptionSchedule | null,
  subscriptionId: string,
  currentPlan: BillingPlan | null,
  now: number,
  resolvePrice: (
    price: Stripe.SubscriptionSchedule.Phase.Item['price'],
  ) => BillingPlan | null,
): ScheduleState {
  if (!schedule || !LIVE_SCHEDULE_STATUSES.has(schedule.status)) {
    return { kind: 'none' };
  }

  const scheduleSubscription =
    typeof schedule.subscription === 'string'
      ? schedule.subscription
      : schedule.subscription?.id;
  const next = schedule.phases.find((phase) => phase.start_date > now);
  const nextItems = next?.items ?? [];
  const futurePlan =
    nextItems.length === 1 ? resolvePrice(nextItems[0].price) : null;
  const ours =
    schedule.metadata?.app === PLAN_CHANGE_SCHEDULE_METADATA.app &&
    schedule.metadata?.purpose === PLAN_CHANGE_SCHEDULE_METADATA.purpose &&
    scheduleSubscription === subscriptionId;

  if (ours && !next) return { kind: 'finished', scheduleId: schedule.id };
  if (ours && next && futurePlan && futurePlan !== currentPlan) {
    return {
      kind: 'pending',
      scheduleId: schedule.id,
      targetPlan: futurePlan,
      effectiveAt: next.start_date,
    };
  }
  return {
    kind: 'foreign',
    scheduleId: schedule.id,
    futurePlan,
    effectiveAt: next?.start_date ?? null,
  };
}

type PhaseSettings = Omit<
  Stripe.SubscriptionScheduleUpdateParams.Phase,
  'items'
>;

/**
 * Stripe unsets every phase field an update omits, so the current phase is
 * re-sent with all of its settings; the next phase only swaps the price.
 */
export function buildDowngradeScheduleUpdate(input: {
  currentPhase: Stripe.SubscriptionSchedule.Phase;
  /** Unix seconds; the current billing period end, where the new price starts. */
  periodEnd: number;
  targetPriceId: string;
  targetPlan: BillingPlan;
  subscriptionMetadata: Stripe.Metadata;
}): Stripe.SubscriptionScheduleUpdateParams {
  const { currentPhase, subscriptionMetadata } = input;
  const settings = phaseSettings(currentPhase);
  const metadata =
    currentPhase.metadata && Object.keys(currentPhase.metadata).length > 0
      ? currentPhase.metadata
      : subscriptionMetadata;
  const quantity = currentPhase.items[0]?.quantity ?? 1;

  return {
    end_behavior: 'release',
    proration_behavior: 'none',
    metadata: {
      ...PLAN_CHANGE_SCHEDULE_METADATA,
      target_plan: input.targetPlan,
    },
    phases: [
      {
        ...settings,
        start_date: currentPhase.start_date,
        end_date: input.periodEnd,
        items: currentPhase.items.map(toItemParams),
        metadata,
        proration_behavior: currentPhase.proration_behavior,
      },
      {
        ...settings,
        items: [{ price: input.targetPriceId, quantity }],
        // Keeps tenant_id on the subscription once this phase starts.
        metadata: subscriptionMetadata,
        proration_behavior: 'none',
      },
    ],
  };
}

/** Phase-level settings that must survive the update (items, dates and metadata are handled by the caller). */
function phaseSettings(
  phase: Stripe.SubscriptionSchedule.Phase,
): PhaseSettings {
  const settings: PhaseSettings = {};

  if (phase.currency) settings.currency = phase.currency;
  if (phase.collection_method) {
    settings.collection_method = phase.collection_method;
  }
  const paymentMethod = idOf(phase.default_payment_method);
  if (paymentMethod) settings.default_payment_method = paymentMethod;
  if (phase.default_tax_rates?.length) {
    settings.default_tax_rates = phase.default_tax_rates.map((rate) => rate.id);
  }
  if (phase.description) settings.description = phase.description;
  const discounts = phase.discounts.map(toDiscountParam).filter(isDefined);
  if (discounts.length > 0) settings.discounts = discounts;
  if (phase.automatic_tax?.enabled) {
    const liability = phase.automatic_tax.liability;
    const liabilityAccount = idOf(liability?.account);
    settings.automatic_tax = {
      enabled: true,
      ...(liability
        ? {
            liability: {
              type: liability.type,
              ...(liabilityAccount ? { account: liabilityAccount } : {}),
            },
          }
        : {}),
    };
  }
  if (phase.invoice_settings) {
    const accountTaxIds = (phase.invoice_settings.account_tax_ids ?? [])
      .map(idOf)
      .filter(isDefined);
    settings.invoice_settings = {
      ...(phase.invoice_settings.days_until_due != null
        ? { days_until_due: phase.invoice_settings.days_until_due }
        : {}),
      ...(accountTaxIds.length > 0 ? { account_tax_ids: accountTaxIds } : {}),
    };
  }
  if (phase.billing_thresholds) {
    settings.billing_thresholds = {
      ...(phase.billing_thresholds.amount_gte != null
        ? { amount_gte: phase.billing_thresholds.amount_gte }
        : {}),
      ...(phase.billing_thresholds.reset_billing_cycle_anchor != null
        ? {
            reset_billing_cycle_anchor:
              phase.billing_thresholds.reset_billing_cycle_anchor,
          }
        : {}),
    };
  }
  const onBehalfOf = idOf(phase.on_behalf_of);
  if (onBehalfOf) settings.on_behalf_of = onBehalfOf;
  if (phase.transfer_data) {
    const destination = idOf(phase.transfer_data.destination);
    if (destination) {
      settings.transfer_data = {
        destination,
        ...(phase.transfer_data.amount_percent != null
          ? { amount_percent: phase.transfer_data.amount_percent }
          : {}),
      };
    }
  }
  if (phase.application_fee_percent != null) {
    settings.application_fee_percent = phase.application_fee_percent;
  }
  return settings;
}

function toItemParams(
  item: Stripe.SubscriptionSchedule.Phase.Item,
): Stripe.SubscriptionScheduleUpdateParams.Phase.Item {
  const params: Stripe.SubscriptionScheduleUpdateParams.Phase.Item = {
    price: idOf(item.price) ?? undefined,
    quantity: item.quantity ?? 1,
  };
  if (item.metadata && Object.keys(item.metadata).length > 0) {
    params.metadata = item.metadata;
  }
  if (item.tax_rates?.length) {
    params.tax_rates = item.tax_rates.map((rate) => rate.id);
  }
  const discounts = item.discounts.map(toDiscountParam).filter(isDefined);
  if (discounts.length > 0) params.discounts = discounts;
  return params;
}

function toDiscountParam(discount: {
  coupon: string | { id: string } | null;
  discount: string | { id: string } | null;
  promotion_code: string | { id: string } | null;
}): { coupon?: string; discount?: string; promotion_code?: string } | null {
  const existing = idOf(discount.discount);
  if (existing) return { discount: existing };
  const promotionCode = idOf(discount.promotion_code);
  if (promotionCode) return { promotion_code: promotionCode };
  const coupon = idOf(discount.coupon);
  return coupon ? { coupon } : null;
}

function idOf(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}
