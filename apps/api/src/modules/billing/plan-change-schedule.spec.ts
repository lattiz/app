import type Stripe from 'stripe';
import type { BillingPlan } from './billing.constants';
import {
  buildDowngradeScheduleUpdate,
  classifySchedule,
} from './plan-change-schedule';

const NOW = 1_800_000_000;
const PERIOD_END = NOW + 10 * 86_400;
const SUB = 'sub_1';
const OURS = { app: 'lattiz', purpose: 'plan_change' };

const PRICE_PLANS: Record<string, BillingPlan> = {
  price_basico: 'basico',
  price_pro: 'pro',
};
const resolvePrice = (price: unknown): BillingPlan | null =>
  typeof price === 'string' ? (PRICE_PLANS[price] ?? null) : null;

function phase(
  overrides: Partial<Stripe.SubscriptionSchedule.Phase> & {
    price?: string;
  } = {},
): Stripe.SubscriptionSchedule.Phase {
  const { price = 'price_pro', ...rest } = overrides;
  return {
    add_invoice_items: [],
    application_fee_percent: null,
    billing_cycle_anchor: null,
    billing_thresholds: null,
    collection_method: 'charge_automatically',
    currency: 'mxn',
    default_payment_method: 'pm_1',
    default_tax_rates: [],
    description: null,
    discounts: [],
    end_date: PERIOD_END,
    invoice_settings: null,
    items: [
      {
        billing_thresholds: null,
        discounts: [],
        metadata: {},
        plan: price,
        price,
        quantity: 1,
        tax_rates: [],
      },
    ],
    metadata: {},
    on_behalf_of: null,
    proration_behavior: 'create_prorations',
    start_date: NOW - 20 * 86_400,
    transfer_data: null,
    trial_end: null,
    ...rest,
  } as Stripe.SubscriptionSchedule.Phase;
}

function schedule(
  phases: Stripe.SubscriptionSchedule.Phase[],
  overrides: Partial<Stripe.SubscriptionSchedule> = {},
): Stripe.SubscriptionSchedule {
  return {
    id: 'sub_sched_1',
    status: 'active',
    subscription: SUB,
    metadata: OURS,
    phases,
    ...overrides,
  } as Stripe.SubscriptionSchedule;
}

describe('classifySchedule', () => {
  const future = phase({ price: 'price_basico', start_date: PERIOD_END });

  it('reports our schedule with a future Básico phase as pending', () => {
    expect(
      classifySchedule(
        schedule([phase(), future]),
        SUB,
        'pro',
        NOW,
        resolvePrice,
      ),
    ).toEqual({
      kind: 'pending',
      scheduleId: 'sub_sched_1',
      targetPlan: 'basico',
      effectiveAt: PERIOD_END,
    });
  });

  it('reports our schedule with no future phase as finished', () => {
    expect(
      classifySchedule(
        schedule([phase({ price: 'price_basico' })]),
        SUB,
        'basico',
        NOW,
        resolvePrice,
      ),
    ).toEqual({ kind: 'finished', scheduleId: 'sub_sched_1' });
  });

  it('treats an unmarked schedule, or one for another subscription, as foreign', () => {
    expect(
      classifySchedule(
        schedule([phase(), future], { metadata: {} }),
        SUB,
        'pro',
        NOW,
        resolvePrice,
      ),
    ).toEqual({
      kind: 'foreign',
      scheduleId: 'sub_sched_1',
      futurePlan: 'basico',
      effectiveAt: PERIOD_END,
    });
    expect(
      classifySchedule(
        schedule([phase(), future], { subscription: 'sub_other' }),
        SUB,
        'pro',
        NOW,
        resolvePrice,
      ).kind,
    ).toBe('foreign');
  });

  it('ignores released or canceled schedules', () => {
    expect(
      classifySchedule(
        schedule([phase(), future], { status: 'released' }),
        SUB,
        'pro',
        NOW,
        resolvePrice,
      ),
    ).toEqual({ kind: 'none' });
  });
});

describe('buildDowngradeScheduleUpdate', () => {
  const subscriptionMetadata = {
    tenant_id: 't-1',
    plan: 'pro',
    lookup_key: 'pro_monthly',
  };

  it('preserves the current phase and adds a Básico phase that releases afterwards', () => {
    const current = phase({
      discounts: [{ coupon: 'co_1', discount: null, promotion_code: null }],
      default_tax_rates: [{ id: 'txr_1' } as Stripe.TaxRate],
    });
    const update = buildDowngradeScheduleUpdate({
      currentPhase: current,
      periodEnd: PERIOD_END,
      targetPriceId: 'price_basico',
      targetPlan: 'basico',
      subscriptionMetadata,
    });

    expect(update.end_behavior).toBe('release');
    expect(update.proration_behavior).toBe('none');
    expect(update.metadata).toMatchObject(OURS);
    const [kept, next] = update.phases ?? [];
    expect(kept).toMatchObject({
      start_date: current.start_date,
      end_date: PERIOD_END,
      items: [{ price: 'price_pro', quantity: 1 }],
      currency: 'mxn',
      collection_method: 'charge_automatically',
      default_payment_method: 'pm_1',
      default_tax_rates: ['txr_1'],
      discounts: [{ coupon: 'co_1' }],
      proration_behavior: 'create_prorations',
      metadata: subscriptionMetadata,
    });
    expect(next).toMatchObject({
      items: [{ price: 'price_basico', quantity: 1 }],
      default_payment_method: 'pm_1',
      proration_behavior: 'none',
      metadata: subscriptionMetadata,
    });
    expect(next).not.toHaveProperty('start_date');
    expect(next).not.toHaveProperty('end_date');
  });
});
