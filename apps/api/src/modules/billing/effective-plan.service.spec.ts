import { Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import type { BillingPricesService } from './billing-prices.service';
import {
  fakeDb,
  NOW_S,
  PERIOD_END_S,
  price,
  subscription,
} from './billing.fixtures-spec';
import { EffectivePlanService } from './effective-plan.service';
import { SubscriptionStateService } from './subscription-state.service';

function setup(schedule?: Stripe.SubscriptionSchedule) {
  const stripe = {
    subscriptions: {
      retrieve: jest.fn().mockResolvedValue(
        subscription({
          itemPrice: price('price_pro_m', 'pro_monthly'),
          schedule: schedule ? schedule.id : null,
        }),
      ),
    },
    subscriptionSchedules: { retrieve: jest.fn().mockResolvedValue(schedule) },
  };
  const { db } = fakeDb(() => [{ stripe_subscription_id: 'sub_1' }]);
  const prices = {
    productPlans: jest.fn().mockResolvedValue(new Map()),
  } as unknown as BillingPricesService;
  const service = new EffectivePlanService(
    db,
    stripe as unknown as Stripe,
    new SubscriptionStateService(stripe as unknown as Stripe, prices),
  );
  return { service, stripe };
}

describe('EffectivePlanService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('never reads Stripe for a non-Pro plan', async () => {
    const { service, stripe } = setup();
    await expect(service.effectivePlanFor('tenant-1', 'basico')).resolves.toBe(
      'basico',
    );
    await expect(
      service.effectivePlanFor('tenant-1', null),
    ).resolves.toBeNull();
    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  it('keeps Pro without a scheduled change', async () => {
    const { service } = setup();
    await expect(service.effectivePlanFor('tenant-1', 'pro')).resolves.toBe(
      'pro',
    );
  });

  it('is basico while a downgrade to Básico is pending', async () => {
    const { service } = setup({
      id: 'sub_sched_1',
      status: 'active',
      subscription: 'sub_1',
      metadata: { app: 'lattiz', purpose: 'plan_change' },
      phases: [
        {
          start_date: NOW_S - 86_400,
          end_date: PERIOD_END_S,
          items: [{ price: price('price_pro_m', 'pro_monthly') }],
        },
        {
          start_date: PERIOD_END_S,
          end_date: PERIOD_END_S + 30 * 86_400,
          items: [{ price: price('price_basico_m', 'basico_monthly') }],
        },
      ],
    } as unknown as Stripe.SubscriptionSchedule);
    await expect(service.effectivePlanFor('tenant-1', 'pro')).resolves.toBe(
      'basico',
    );
  });

  it('fails closed to basico when Stripe is unreachable', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockRejectedValue(new Error('timeout'));
    await expect(service.effectivePlanFor('tenant-1', 'pro')).resolves.toBe(
      'basico',
    );
  });
});
