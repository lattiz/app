import { Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import type { DomainsService } from '../domains/domains.service';
import type { EmailOutboxService } from '../email/application/email-outbox.service';
import type { BillingPricesService } from './billing-prices.service';
import { BillingService } from './billing.service';
import {
  BillingProviderUnavailableException,
  SubscriptionAlreadyActiveException,
} from './billing.exceptions';
import {
  fakeDb,
  NOW_S,
  PERIOD_END_S,
  price,
  type RenderedQuery,
  subscription,
} from './billing.fixtures-spec';
import { SubscriptionStateService } from './subscription-state.service';

const PRO_MONTHLY = price('price_pro_m', 'pro_monthly');

function setup(options: {
  fresh: Stripe.Subscription;
  processed?: boolean;
  schedule?: Stripe.SubscriptionSchedule;
  productPlans?: Map<string, 'basico' | 'pro'>;
  tenantByCustomer?: string;
}) {
  const stripe = {
    webhooks: { constructEvent: jest.fn() },
    subscriptions: { retrieve: jest.fn().mockResolvedValue(options.fresh) },
    subscriptionSchedules: {
      retrieve: jest.fn().mockResolvedValue(options.schedule),
      release: jest.fn().mockResolvedValue({}),
    },
  };
  const { db, queries } = fakeDb((q) => {
    if (q.sql.includes('FROM public.stripe_webhook_events')) {
      return options.processed ? [{ processed_at: new Date() }] : [];
    }
    if (q.sql.includes('WHERE stripe_customer_id')) {
      return options.tenantByCustomer ? [{ id: options.tenantByCustomer }] : [];
    }
    return [];
  });
  const prices = {
    productPlans: jest
      .fn()
      .mockResolvedValue(options.productPlans ?? new Map()),
  } as unknown as BillingPricesService;
  const domains = {
    relaunchDomain: jest.fn().mockResolvedValue({ relaunched: false }),
  };
  const emails = { enqueueForTenant: jest.fn() };
  const service = new BillingService(
    stripe as unknown as Stripe,
    db,
    domains as unknown as DomainsService,
    emails as unknown as EmailOutboxService,
    new SubscriptionStateService(stripe as unknown as Stripe, prices),
  );

  const deliver = (event: Partial<Stripe.Event>) => {
    stripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_1',
      ...event,
    });
    return service.handleWebhook(Buffer.from('{}'), 'sig');
  };
  return { service, stripe, queries, deliver };
}

const tenantPlanWrites = (queries: RenderedQuery[]) =>
  queries
    .filter((q) => q.sql.startsWith('UPDATE public.tenants SET plan'))
    .map((q) => q.params[0]);

const subscriptionUpdated = (object: Partial<Stripe.Subscription>) => ({
  type: 'customer.subscription.updated' as const,
  data: { object: object as Stripe.Subscription },
});

describe('BillingService subscription sync', () => {
  let errors: jest.SpyInstance;

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    errors = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('derives the plan from the fresh price, not stale metadata or the event payload', async () => {
    // Upgraded through the portal: metadata still says basico.
    const fresh = subscription({ itemPrice: PRO_MONTHLY });
    const { stripe, queries, deliver } = setup({ fresh });

    await deliver(
      subscriptionUpdated({ id: 'sub_1', items: { data: [] } as never }),
    );

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_1');
    expect(tenantPlanWrites(queries)).toEqual(['pro']);
    const upsert = queries.find((q) =>
      q.sql.startsWith('INSERT INTO public.subscriptions'),
    );
    expect(upsert?.params).toEqual(
      expect.arrayContaining([
        'pro',
        'monthly',
        new Date(PERIOD_END_S * 1000).toISOString(),
      ]),
    );
  });

  it('falls back to the price product when the lookup key moved to another price', async () => {
    const fresh = subscription({
      itemPrice: price('price_old', null, 'year', 'prod_pro'),
    });
    const { queries, deliver } = setup({
      fresh,
      productPlans: new Map([['prod_pro', 'pro']]),
    });
    await deliver(subscriptionUpdated({ id: 'sub_1' }));
    expect(tenantPlanWrites(queries)).toEqual(['pro']);
  });

  it('leaves the plan alone and alerts on a price that maps to no plan', async () => {
    const fresh = subscription({
      itemPrice: price('price_mystery', 'something_else'),
      metadata: { tenant_id: 'tenant-1' },
    });
    const { queries, deliver } = setup({ fresh });
    await deliver(subscriptionUpdated({ id: 'sub_1' }));

    expect(tenantPlanWrites(queries)).toEqual([]);
    expect(
      errors.mock.calls.some(([msg]) =>
        String(msg).startsWith('[ADMIN_ALERT]'),
      ),
    ).toBe(true);
  });

  it('resolves the tenant from the customer when metadata lost tenant_id', async () => {
    const fresh = subscription({ itemPrice: PRO_MONTHLY, metadata: {} });
    const { queries, deliver } = setup({ fresh, tenantByCustomer: 'tenant-9' });
    await deliver(subscriptionUpdated({ id: 'sub_1' }));
    const write = queries.find((q) =>
      q.sql.startsWith('UPDATE public.tenants SET plan'),
    );
    expect(write?.params).toEqual(['pro', 'cus_1', 'tenant-9']);
  });

  it('skips an event that was already processed and records new ones', async () => {
    const duplicate = setup({ fresh: subscription(), processed: true });
    await duplicate.deliver(subscriptionUpdated({ id: 'sub_1' }));
    expect(duplicate.stripe.subscriptions.retrieve).not.toHaveBeenCalled();

    const first = setup({ fresh: subscription() });
    await first.deliver(subscriptionUpdated({ id: 'sub_1' }));
    expect(
      first.queries.some((q) =>
        q.sql.startsWith('INSERT INTO public.stripe_webhook_events'),
      ),
    ).toBe(true);
  });

  it('does not mark a failed event as processed, so the redelivery retries', async () => {
    const { stripe, queries, deliver } = setup({ fresh: subscription() });
    stripe.subscriptions.retrieve.mockRejectedValue(new Error('stripe down'));
    await expect(deliver(subscriptionUpdated({ id: 'sub_1' }))).rejects.toThrow(
      'stripe down',
    );
    expect(
      queries.some((q) =>
        q.sql.startsWith('INSERT INTO public.stripe_webhook_events'),
      ),
    ).toBe(false);
  });

  it('acknowledges unhandled event types', async () => {
    const { stripe, deliver } = setup({ fresh: subscription() });
    await expect(
      deliver({ type: 'customer.created', data: { object: {} } } as never),
    ).resolves.toBeUndefined();
    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  it('after a scheduled downgrade starts: plan becomes basico and our schedule is released', async () => {
    const fresh = subscription({
      itemPrice: price('price_basico_m', 'basico_monthly'),
      schedule: 'sub_sched_1',
      metadata: {
        tenant_id: 'tenant-1',
        plan: 'pro',
        lookup_key: 'pro_monthly',
      },
    });
    const schedule = {
      id: 'sub_sched_1',
      status: 'active',
      subscription: 'sub_1',
      metadata: { app: 'lattiz', purpose: 'plan_change' },
      phases: [
        {
          start_date: NOW_S - 86_400,
          end_date: PERIOD_END_S,
          items: [{ price: price('price_basico_m', 'basico_monthly') }],
        },
      ],
    } as unknown as Stripe.SubscriptionSchedule;
    const { stripe, queries, deliver } = setup({ fresh, schedule });

    await deliver({
      type: 'subscription_schedule.updated',
      data: {
        object: { subscription: 'sub_1' } as Stripe.SubscriptionSchedule,
      },
    } as never);

    expect(tenantPlanWrites(queries)).toEqual(['basico']);
    expect(stripe.subscriptionSchedules.release).toHaveBeenCalledWith(
      'sub_sched_1',
    );
  });

  it('keeps tenants.plan when a payment fails on an upgrade (Stripe keeps the old price)', async () => {
    // pending_if_incomplete / failed proration: Stripe still bills Básico.
    const fresh = subscription({ status: 'past_due' });
    const { queries, deliver } = setup({ fresh });
    await deliver(subscriptionUpdated({ id: 'sub_1' }));
    expect(tenantPlanWrites(queries)).toEqual(['basico']);
  });
});

const CHECKOUT_USER = '11111111-1111-4111-8111-111111111111';
const CHECKOUT_DTO = { plan: 'pro' as const, period: 'monthly' as const };
const APP_URL = 'http://localhost:5173';

function checkoutSetup(options: {
  stripeCustomerId?: string | null;
  subscriptions?: Array<Partial<Stripe.Subscription>>;
  listError?: Error;
}) {
  const stripe = {
    prices: {
      list: jest
        .fn()
        .mockResolvedValue({ data: [price('price_pro_m', 'pro_monthly')] }),
    },
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_new' }),
    },
    subscriptions: {
      list: options.listError
        ? jest.fn().mockRejectedValue(options.listError)
        : jest.fn().mockResolvedValue({
            data: (options.subscriptions ?? []).map((overrides) =>
              subscription(overrides),
            ),
          }),
    },
    checkout: {
      sessions: {
        create: jest
          .fn()
          .mockResolvedValue({ url: 'https://checkout.stripe.test/cs_1' }),
      },
    },
  };
  const stripeCustomerId =
    options.stripeCustomerId === undefined ? 'cus_1' : options.stripeCustomerId;
  const { db } = fakeDb((q) => {
    if (q.sql.includes('FROM public.tenants')) {
      return [
        {
          id: 'tenant-1',
          name: 'Cafe',
          stripe_customer_id: stripeCustomerId,
        },
      ];
    }
    return [];
  });
  const service = new BillingService(
    stripe as unknown as Stripe,
    db,
    { relaunchDomain: jest.fn() } as unknown as DomainsService,
    { enqueueForTenant: jest.fn() } as unknown as EmailOutboxService,
    {} as SubscriptionStateService,
  );
  return { service, stripe };
}

describe('BillingService createCheckoutSession', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it.each(['active', 'past_due', 'trialing'] as const)(
    'rejects a %s subscription without opening checkout',
    async (status) => {
      const { service, stripe } = checkoutSetup({
        subscriptions: [{ status }],
      });

      await expect(
        service.createCheckoutSession(CHECKOUT_USER, CHECKOUT_DTO, APP_URL),
      ).rejects.toBeInstanceOf(SubscriptionAlreadyActiveException);
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cus_1',
        status: 'all',
        limit: 100,
      });
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    },
  );

  it('opens checkout when the tenant has no Stripe customer yet', async () => {
    const { service, stripe } = checkoutSetup({ stripeCustomerId: null });

    await expect(
      service.createCheckoutSession(CHECKOUT_USER, CHECKOUT_DTO, APP_URL),
    ).resolves.toEqual({ url: 'https://checkout.stripe.test/cs_1' });
    expect(stripe.subscriptions.list).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.create).toHaveBeenCalled();
  });

  it('opens checkout when the customer has no subscriptions', async () => {
    const { service, stripe } = checkoutSetup({ subscriptions: [] });

    await expect(
      service.createCheckoutSession(CHECKOUT_USER, CHECKOUT_DTO, APP_URL),
    ).resolves.toEqual({ url: 'https://checkout.stripe.test/cs_1' });
    expect(stripe.checkout.sessions.create).toHaveBeenCalled();
  });

  it('opens checkout when every subscription is canceled', async () => {
    const { service, stripe } = checkoutSetup({
      subscriptions: [{ status: 'canceled' }],
    });

    await expect(
      service.createCheckoutSession(CHECKOUT_USER, CHECKOUT_DTO, APP_URL),
    ).resolves.toEqual({ url: 'https://checkout.stripe.test/cs_1' });
    expect(stripe.checkout.sessions.create).toHaveBeenCalled();
  });

  it('fails closed when listing subscriptions throws', async () => {
    const { service, stripe } = checkoutSetup({
      listError: new Error('stripe down'),
    });

    await expect(
      service.createCheckoutSession(CHECKOUT_USER, CHECKOUT_DTO, APP_URL),
    ).rejects.toBeInstanceOf(BillingProviderUnavailableException);
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });
});
