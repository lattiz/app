import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type Stripe from 'stripe';
import type { Database } from '../../../database/database.module';
import {
  AdminNotFoundException,
  AdminStripeUnavailableException,
  SubscriptionNotCancelableException,
  SubscriptionNotResumableException,
  SubscriptionScheduleActiveException,
} from '../admin.exceptions';
import type { SubscriptionOverviewRow } from './admin-subscriptions.mapper';
import {
  AdminSubscriptionsService,
  SUBSCRIPTION_STRIPE_CACHE_TTL_MS,
} from './admin-subscriptions.service';

const dialect = new PgDialect();
const ID = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';
const TENANT = '7a1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c22';

const ROW: SubscriptionOverviewRow = {
  id: ID,
  tenant_id: TENANT,
  stripe_subscription_id: 'sub_123',
  plan: 'pro',
  billing_period: 'monthly',
  status: 'active',
  current_period_end: new Date('2026-11-01T00:00:00.000Z'),
  cancel_at_period_end: false,
  cancel_at: new Date('2026-12-01T00:00:00.000Z'),
  payment_attempts: 2,
  created_at: new Date('2026-01-15T00:00:00.000Z'),
  canceled_at: null,
  tenant_slug: 'cafe-centro',
  tenant_name: 'Café Centro',
  email: 'ana@example.com',
};

const CARD = {
  id: 'pm_1',
  object: 'payment_method',
  type: 'card',
  card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2030 },
};

function subscription(
  overrides: Record<string, unknown> = {},
): Stripe.Subscription {
  return {
    id: 'sub_123',
    status: 'active',
    schedule: 'sub_sched_1',
    default_payment_method: null,
    customer: {
      id: 'cus_1',
      object: 'customer',
      invoice_settings: { default_payment_method: CARD },
    },
    discounts: [
      {
        id: 'di_1',
        source: {
          type: 'coupon',
          coupon: {
            id: 'co_1',
            percent_off: 20,
            amount_off: null,
            currency: null,
          },
        },
      },
    ],
    items: {
      data: [
        {
          price: {
            id: 'price_pro_m',
            unit_amount: 49900,
            currency: 'mxn',
            lookup_key: 'pro_monthly',
            recurring: { interval: 'month', interval_count: 1 },
          },
        },
      ],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function schedule(): Stripe.SubscriptionSchedule {
  return {
    id: 'sub_sched_1',
    status: 'active',
    phases: [
      {
        start_date: 1_800_003_600,
        end_date: 1_810_000_000,
        items: [{ price: 'price_custom' }],
      },
      {
        start_date: 1_800_000_000,
        end_date: 1_800_003_600,
        items: [
          {
            price: {
              id: 'price_pro_m',
              lookup_key: 'pro_monthly',
              recurring: { interval: 'month' },
            },
          },
        ],
      },
    ],
  } as unknown as Stripe.SubscriptionSchedule;
}

function invoice(): Stripe.Invoice {
  return {
    number: 'INV-001',
    status: 'paid',
    total: 49900,
    currency: 'mxn',
    created: 1_700_000_000,
    status_transitions: { paid_at: 1_700_000_100 },
    hosted_invoice_url: 'https://invoice.stripe.com/i/1',
    invoice_pdf: 'https://invoice.stripe.com/i/1/pdf',
  } as unknown as Stripe.Invoice;
}

function upcoming(): Stripe.Invoice {
  return {
    total: 39920,
    currency: 'mxn',
    next_payment_attempt: 1_800_000_000,
    due_date: null,
    period_end: 1_700_000_000,
  } as unknown as Stripe.Invoice;
}

function setup() {
  const execute: jest.Mock = jest.fn(async () => [ROW]);
  const stripe = {
    subscriptions: {
      retrieve: jest.fn().mockResolvedValue(subscription()),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    invoices: {
      list: jest.fn().mockResolvedValue({ data: [invoice()] }),
      createPreview: jest.fn().mockResolvedValue(upcoming()),
    },
    subscriptionSchedules: {
      retrieve: jest.fn().mockResolvedValue(schedule()),
    },
  };
  const service = new AdminSubscriptionsService(
    { execute } as unknown as Database,
    stripe as unknown as Stripe,
  );
  return { service, execute, stripe };
}

describe('AdminSubscriptionsService', () => {
  const previousKey = process.env.STRIPE_SECRET_KEY;

  afterEach(() => {
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  });

  it('maps the local row and the live Stripe detail', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
    const { service, stripe } = setup();

    const detail = await service.get(ID, 0);

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_123', {
      expand: [
        'discounts.source.coupon',
        'default_payment_method',
        'customer.invoice_settings.default_payment_method',
      ],
    });
    expect(stripe.invoices.list).toHaveBeenCalledWith({
      subscription: 'sub_123',
      limit: 24,
    });
    expect(stripe.invoices.createPreview).toHaveBeenCalledWith({
      subscription: 'sub_123',
    });
    expect(stripe.subscriptionSchedules.retrieve).toHaveBeenCalledWith(
      'sub_sched_1',
      { expand: ['phases.items.price'] },
    );
    expect(detail.stripeError).toBeNull();
    expect(detail).toEqual({
      local: {
        id: ID,
        stripeSubscriptionId: 'sub_123',
        tenant: {
          id: TENANT,
          slug: 'cafe-centro',
          name: 'Café Centro',
          email: 'ana@example.com',
        },
        plan: 'pro',
        period: 'monthly',
        status: 'active',
        currentPeriodEnd: '2026-11-01T00:00:00.000Z',
        cancelAt: '2026-12-01T00:00:00.000Z',
        cancelAtPeriodEnd: true,
        paymentAttempts: 2,
        createdAt: '2026-01-15T00:00:00.000Z',
        canceledAt: null,
        stripeDashboardUrl:
          'https://dashboard.stripe.com/test/subscriptions/sub_123',
      },
      stripeError: null,
      stripe: {
        status: 'active',
        price: {
          unitAmount: 49900,
          currency: 'mxn',
          interval: 'month',
          intervalCount: 1,
          discount: { percentOff: 20, amountOff: null, currency: null },
        },
        paymentMethod: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2030,
        },
        upcomingInvoice: {
          total: 39920,
          currency: 'mxn',
          date: '2027-01-15T08:00:00.000Z',
        },
        schedule: {
          id: 'sub_sched_1',
          status: 'active',
          phases: [
            {
              plan: 'pro',
              priceId: 'price_pro_m',
              start: '2027-01-15T08:00:00.000Z',
              end: '2027-01-15T09:00:00.000Z',
            },
            {
              plan: null,
              priceId: 'price_custom',
              start: '2027-01-15T09:00:00.000Z',
              end: '2027-05-11T01:46:40.000Z',
            },
          ],
        },
        invoices: [
          {
            number: 'INV-001',
            status: 'paid',
            total: 49900,
            currency: 'mxn',
            createdAt: '2023-11-14T22:13:20.000Z',
            paidAt: '2023-11-14T22:15:00.000Z',
            hostedInvoiceUrl: 'https://invoice.stripe.com/i/1',
            invoicePdf: 'https://invoice.stripe.com/i/1/pdf',
          },
        ],
      },
    });
    expect(detail.local.stripeDashboardUrl).not.toContain('sk_test');
  });

  it('returns stripe null when Stripe fails and does not cache the failure', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockRejectedValue(new Error('stripe down'));

    const first = await service.get(ID, 0);
    const second = await service.get(ID, 1_000);

    expect(first.stripe).toBeNull();
    expect(first.stripeError).toBe('unavailable');
    expect(first.local.id).toBe(ID);
    expect(second.stripeError).toBe('unavailable');
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(2);
    expect(stripe.invoices.list).not.toHaveBeenCalled();
  });

  it('keeps the Stripe payload when only the invoice preview fails', async () => {
    const { service, stripe } = setup();
    stripe.invoices.createPreview.mockRejectedValue(new Error('no upcoming'));

    const detail = await service.get(ID, 0);

    expect(detail.stripeError).toBeNull();
    expect(detail.stripe?.upcomingInvoice).toBeNull();
    expect(detail.stripe?.price?.unitAmount).toBe(49900);
  });

  it('skips the invoice preview when the subscription is canceled', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockResolvedValue(
      subscription({ status: 'canceled', schedule: null }),
    );

    const detail = await service.get(ID, 0);

    expect(stripe.invoices.createPreview).not.toHaveBeenCalled();
    expect(stripe.subscriptionSchedules.retrieve).not.toHaveBeenCalled();
    expect(detail.stripe?.upcomingInvoice).toBeNull();
    expect(detail.stripe?.schedule).toBeNull();
    expect(detail.stripeError).toBeNull();
  });

  it('reuses the Stripe snapshot for 60 seconds', async () => {
    const { service, stripe } = setup();

    await service.get(ID, 0);
    await service.get(ID, SUBSCRIPTION_STRIPE_CACHE_TTL_MS - 1);
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(1);

    await service.get(ID, SUBSCRIPTION_STRIPE_CACHE_TTL_MS);
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(2);
  });

  it('builds a test or live dashboard link without exposing the key', async () => {
    const { service, execute, stripe } = setup();
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      if (text.includes('count(*)')) return [{ total: '1' }];
      return [ROW];
    });

    process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
    const testList = await service.list({});
    process.env.STRIPE_SECRET_KEY = 'sk_live_unit';
    const liveList = await service.list({});

    expect(testList.total).toBe(1);
    expect(testList.items[0]?.stripeDashboardUrl).toBe(
      'https://dashboard.stripe.com/test/subscriptions/sub_123',
    );
    expect(liveList.items[0]?.stripeDashboardUrl).toBe(
      'https://dashboard.stripe.com/subscriptions/sub_123',
    );
    expect(liveList.items[0]?.stripeDashboardUrl).not.toContain('sk_live');
    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  it('returns ADMIN_NOT_FOUND when the row is missing', async () => {
    const { service, execute, stripe } = setup();
    execute.mockResolvedValue([]);

    await expect(service.get(ID)).rejects.toMatchObject({
      code: 'ADMIN_NOT_FOUND',
      message: 'No se encontró la suscripción.',
    });
    await expect(service.get(ID)).rejects.toBeInstanceOf(
      AdminNotFoundException,
    );
    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });
});

const ACTOR = '11111111-1111-4111-8111-111111111111';
const REASON = 'Fraude reportado por soporte';

function live(overrides: Record<string, unknown> = {}): Stripe.Subscription {
  return subscription({
    schedule: null,
    status: 'active',
    cancel_at: null,
    cancel_at_period_end: false,
    ...overrides,
  });
}

function sqlText(execute: jest.Mock): string {
  return execute.mock.calls
    .map((call) => dialect.sqlToQuery(call[0] as SQL).sql)
    .join('\n');
}

function idempotencyKeysFrom(mocks: jest.Mock[]): string[] {
  return mocks.flatMap((mock) =>
    mock.mock.calls.flatMap((call) =>
      call.flatMap((arg: unknown) => {
        if (
          arg !== null &&
          typeof arg === 'object' &&
          'idempotencyKey' in arg &&
          typeof arg.idempotencyKey === 'string'
        ) {
          return [arg.idempotencyKey];
        }
        return [];
      }),
    ),
  );
}

describe('AdminSubscriptionsService support actions', () => {
  const input = {
    mode: 'period_end' as const,
    reason: REASON,
    actorUserId: ACTOR,
    auditRequestId: 'req-1',
  };

  it('schedules cancel_at_period_end with metadata and an idempotency key', async () => {
    const { service, execute, stripe } = setup();
    await service.get(ID, 0);
    stripe.subscriptions.retrieve.mockResolvedValue(live());
    stripe.subscriptions.update.mockResolvedValue(
      live({ cancel_at_period_end: true }),
    );

    const result = await service.cancel(ID, input);

    expect(stripe.subscriptions.update).toHaveBeenCalledWith(
      'sub_123',
      {
        cancel_at_period_end: true,
        metadata: { admin_actor: ACTOR, admin_reason: REASON },
      },
      { idempotencyKey: 'admin-cancel:sub_123:period_end:req-1:period_end' },
    );
    expect(stripe.subscriptions.cancel).not.toHaveBeenCalled();
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(3);
    expect(result.before).toEqual({
      status: 'active',
      cancelAtPeriodEnd: false,
      cancelAt: null,
    });
    expect(result.after).toMatchObject({
      status: 'active',
      cancelAtPeriodEnd: true,
      mode: 'period_end',
      reason: REASON,
    });
    expect(sqlText(execute)).not.toMatch(/\b(insert|update|delete)\b/i);
    expect(sqlText(execute)).not.toContain('public.subscriptions');
    expect(sqlText(execute)).not.toContain('subscriptions');
  });

  it('writes metadata and then cancels immediately without proration', async () => {
    const { service, execute, stripe } = setup();
    const order: string[] = [];
    stripe.subscriptions.retrieve.mockResolvedValue(live());
    stripe.subscriptions.update.mockImplementation(async () => {
      order.push('update');
      return live();
    });
    stripe.subscriptions.cancel.mockImplementation(async () => {
      order.push('cancel');
      return live({ status: 'canceled' });
    });

    const result = await service.cancel(ID, { ...input, mode: 'now' });

    expect(order).toEqual(['update', 'cancel']);
    expect(stripe.subscriptions.update).toHaveBeenCalledWith(
      'sub_123',
      { metadata: { admin_actor: ACTOR, admin_reason: REASON } },
      { idempotencyKey: 'admin-cancel:sub_123:now:req-1:meta' },
    );
    expect(stripe.subscriptions.cancel).toHaveBeenCalledWith(
      'sub_123',
      { prorate: false },
      { idempotencyKey: 'admin-cancel:sub_123:now:req-1:cancel' },
    );
    expect(result.after.status).toBe('canceled');
    expect(sqlText(execute)).not.toContain('subscriptions');
  });

  it('uses a distinct idempotency key for every Stripe call in the same action', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockResolvedValue(live());
    stripe.subscriptions.update.mockResolvedValue(live());
    stripe.subscriptions.cancel.mockResolvedValue(
      live({ status: 'canceled' }),
    );

    await service.cancel(ID, { ...input, mode: 'now' });

    const keys = idempotencyKeysFrom([
      stripe.subscriptions.retrieve,
      stripe.subscriptions.update,
      stripe.subscriptions.cancel,
      stripe.invoices.list,
      stripe.invoices.createPreview,
      stripe.subscriptionSchedules.retrieve,
    ]);
    expect(keys).toEqual([
      'admin-cancel:sub_123:now:req-1:meta',
      'admin-cancel:sub_123:now:req-1:cancel',
    ]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(['canceled', 'incomplete_expired'])(
    'rejects a %s subscription',
    async (status) => {
      const { service, stripe } = setup();
      stripe.subscriptions.retrieve.mockResolvedValue(
        live({ status, schedule: null }),
      );

      await expect(service.cancel(ID, input)).rejects.toBeInstanceOf(
        SubscriptionNotCancelableException,
      );
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
      expect(stripe.subscriptions.cancel).not.toHaveBeenCalled();
    },
  );

  it('rejects a subscription that already has a schedule', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockResolvedValue(
      live({ schedule: 'sub_sched_1' }),
    );

    await expect(service.cancel(ID, input)).rejects.toBeInstanceOf(
      SubscriptionScheduleActiveException,
    );
    await expect(service.cancel(ID, input)).rejects.toMatchObject({
      status: 409,
    });
    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    expect(stripe.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it('turns a Stripe failure into ADMIN_STRIPE_UNAVAILABLE and does not wrap it further', async () => {
    const { service, stripe } = setup();
    const boom = new Error('stripe down');
    stripe.subscriptions.retrieve.mockResolvedValue(live());
    stripe.subscriptions.update.mockRejectedValue(boom);

    const error = await service.cancel(ID, input).then(
      () => {
        throw new Error('expected cancel to fail');
      },
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(AdminStripeUnavailableException);
    expect(error).not.toBe(boom);
    expect(error).toMatchObject({
      code: 'ADMIN_STRIPE_UNAVAILABLE',
      status: 502,
    });
    expect(stripe.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it('clears cancel_at_period_end when that is how the cancel was scheduled', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockResolvedValue(
      live({ cancel_at_period_end: true, cancel_at: null }),
    );
    stripe.subscriptions.update.mockResolvedValue(live());

    const result = await service.resume(ID, 'req-1');

    expect(stripe.subscriptions.update).toHaveBeenCalledWith(
      'sub_123',
      { cancel_at_period_end: false },
      { idempotencyKey: 'admin-resume:sub_123:req-1' },
    );
    expect(result.before.cancelAtPeriodEnd).toBe(true);
    expect(result.after.cancelAtPeriodEnd).toBe(false);
  });

  it('clears cancel_at when the cancel was scheduled by date', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockResolvedValue(
      live({ cancel_at: 1_800_000_000, cancel_at_period_end: false }),
    );
    stripe.subscriptions.update.mockResolvedValue(live());

    const result = await service.resume(ID, 'req-1');

    expect(stripe.subscriptions.update).toHaveBeenCalledWith(
      'sub_123',
      { cancel_at: null },
      { idempotencyKey: 'admin-resume:sub_123:req-1' },
    );
    expect(result.before.cancelAt).toBe(1_800_000_000);
    expect(result.after.cancelAt).toBeNull();
  });

  it('rejects resume when nothing is scheduled or the subscription has ended', async () => {
    const { service, stripe } = setup();
    stripe.subscriptions.retrieve.mockResolvedValue(live());
    await expect(service.resume(ID, 'req-1')).rejects.toBeInstanceOf(
      SubscriptionNotResumableException,
    );

    stripe.subscriptions.retrieve.mockResolvedValue(
      live({ status: 'canceled', cancel_at_period_end: true }),
    );
    await expect(service.resume(ID, 'req-1')).rejects.toMatchObject({
      status: 409,
    });
    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
  });
});
