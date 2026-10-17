import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type Stripe from 'stripe';
import type { Database } from '../../../database/database.module';
import { AdminNotFoundException } from '../admin.exceptions';
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
    subscriptions: { retrieve: jest.fn().mockResolvedValue(subscription()) },
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
