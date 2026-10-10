import { Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import type { DomainsService } from '../domains/domains.service';
import type { BillingPricesService } from './billing-prices.service';
import {
  NoPendingPlanChangeException,
  PlanChangeFailedException,
  PlanChangeNotAllowedException,
  PlanChangeNotConfiguredException,
  SubscriptionOwnershipMismatchException,
} from './billing.exceptions';
import {
  fakeDb,
  NOW_S,
  PERIOD_END_S,
  price,
  subscription,
} from './billing.fixtures-spec';
import { PlanChangeService } from './plan-change.service';
import { SubscriptionStateService } from './subscription-state.service';
import type { TemplateAccessService } from '../templates/template-access.service';
import {
  BillingTenantAccessDeniedException,
  PlanChangeImpactNotAcknowledgedException,
} from './billing.exceptions';

const APP_URL = 'https://app.example';
const PRICES: Record<string, Stripe.Price> = {
  basico_monthly: price('price_basico_m', 'basico_monthly'),
  basico_annual: price('price_basico_y', 'basico_annual', 'year'),
  pro_monthly: price('price_pro_m', 'pro_monthly'),
  pro_annual: price('price_pro_y', 'pro_annual', 'year'),
};

function schedulePhase(
  priceId: string,
  start: number,
  end: number,
): Stripe.SubscriptionSchedule.Phase {
  return {
    add_invoice_items: [],
    application_fee_percent: null,
    billing_cycle_anchor: null,
    billing_thresholds: null,
    collection_method: 'charge_automatically',
    currency: 'mxn',
    default_payment_method: null,
    description: null,
    discounts: [],
    end_date: end,
    invoice_settings: null,
    items: [
      {
        billing_thresholds: null,
        discounts: [],
        metadata: {},
        plan: priceId,
        price: Object.values(PRICES).find((p) => p.id === priceId) ?? priceId,
        quantity: 1,
      },
    ],
    metadata: {},
    on_behalf_of: null,
    proration_behavior: 'create_prorations',
    start_date: start,
    transfer_data: null,
    trial_end: null,
  } as Stripe.SubscriptionSchedule.Phase;
}

function pendingDowngradeSchedule(
  metadata: Record<string, string> = { app: 'lattiz', purpose: 'plan_change' },
): Stripe.SubscriptionSchedule {
  return {
    id: 'sub_sched_1',
    status: 'active',
    subscription: 'sub_1',
    metadata,
    phases: [
      schedulePhase('price_pro_m', NOW_S - 20 * 86_400, PERIOD_END_S),
      schedulePhase('price_basico_m', PERIOD_END_S, PERIOD_END_S + 30 * 86_400),
    ],
  } as unknown as Stripe.SubscriptionSchedule;
}

function setup(options: {
  sub: Stripe.Subscription;
  schedule?: Stripe.SubscriptionSchedule;
  domainCheck?: 'ok' | 'above_cap' | 'price_unavailable';
  noSubscription?: boolean;
  currentTemplate?: { id: string; name: string | null; tier: string } | null;
}) {
  const stripe = {
    subscriptions: { retrieve: jest.fn().mockResolvedValue(options.sub) },
    subscriptionSchedules: {
      retrieve: jest.fn().mockResolvedValue(options.schedule),
      create: jest.fn().mockResolvedValue({
        id: 'sub_sched_new',
        phases: [
          schedulePhase('price_pro_m', NOW_S - 20 * 86_400, PERIOD_END_S),
        ],
      }),
      update: jest.fn().mockResolvedValue({}),
      release: jest.fn().mockResolvedValue({}),
    },
    prices: {
      list: jest.fn(({ lookup_keys }: { lookup_keys: string[] }) =>
        Promise.resolve({ data: [PRICES[lookup_keys[0]]] }),
      ),
    },
    billingPortal: {
      sessions: {
        create: jest
          .fn()
          .mockResolvedValue({ url: 'https://billing.stripe.com/p/session/x' }),
      },
    },
  };
  const { db } = fakeDb((q) => {
    if (q.sql.includes('AND user_id =')) {
      return q.params.includes('tenant-1') ? [{ ok: 1 }] : [];
    }
    if (q.sql.includes('FROM public.tenants')) {
      return [{ id: 'tenant-1', stripe_customer_id: 'cus_1' }];
    }
    if (q.sql.includes('FROM public.subscriptions')) {
      return options.noSubscription
        ? []
        : [{ stripe_subscription_id: 'sub_1' }];
    }
    return [];
  });
  const prices = {
    productPlans: jest.fn().mockResolvedValue(new Map()),
  } as unknown as BillingPricesService;
  const state = new SubscriptionStateService(
    stripe as unknown as Stripe,
    prices,
  );
  const domains = {
    checkManagedDomainRenewal: jest
      .fn()
      .mockResolvedValue(options.domainCheck ?? 'ok'),
  };
  const templateAccess = {
    stateForTenant: jest.fn().mockResolvedValue({
      current: options.currentTemplate ?? null,
    }),
  };
  const service = new PlanChangeService(
    stripe as unknown as Stripe,
    db,
    state,
    domains as unknown as DomainsService,
    templateAccess as unknown as TemplateAccessService,
  );
  return { service, stripe, domains, templateAccess };
}

const proMonthly = () =>
  subscription({
    itemPrice: PRICES.pro_monthly,
    metadata: { tenant_id: 'tenant-1', plan: 'pro', lookup_key: 'pro_monthly' },
  });

describe('PlanChangeService', () => {
  beforeEach(() => {
    process.env.STRIPE_PORTAL_CONFIGURATION_PLAN_CHANGE = 'bpc_plan_change';
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    delete process.env.STRIPE_PORTAL_CONFIGURATION_PLAN_CHANGE;
    jest.restoreAllMocks();
  });

  describe('upgrade', () => {
    it.each([
      [PRICES.basico_monthly, 'pro_monthly', 'price_pro_m'],
      [PRICES.basico_annual, 'pro_annual', 'price_pro_y'],
    ])(
      'opens a portal confirm flow at the same interval (%#)',
      async (current, key, target) => {
        const { service, stripe } = setup({
          sub: subscription({ itemPrice: current }),
        });
        const result = await service.requestChange('user-1', 'pro', APP_URL);

        expect(result).toEqual({
          kind: 'redirect',
          url: 'https://billing.stripe.com/p/session/x',
          effectiveAt: null,
        });
        expect(stripe.prices.list).toHaveBeenCalledWith(
          expect.objectContaining({ lookup_keys: [key], active: true }),
        );
        expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
          customer: 'cus_1',
          configuration: 'bpc_plan_change',
          locale: 'es-419',
          return_url: `${APP_URL}/dashboard/subscription?plan_change=canceled`,
          flow_data: {
            type: 'subscription_update_confirm',
            subscription_update_confirm: {
              subscription: 'sub_1',
              items: [{ id: 'si_1', price: target, quantity: 1 }],
            },
            after_completion: {
              type: 'redirect',
              redirect: {
                return_url: `${APP_URL}/dashboard/subscription?plan_change=done`,
              },
            },
          },
        });
      },
    );

    it('is not blocked by a domain whose renewal is above the Básico cap', async () => {
      const { service, domains } = setup({
        sub: subscription(),
        domainCheck: 'above_cap',
      });
      await expect(
        service.requestChange('user-1', 'pro', APP_URL),
      ).resolves.toMatchObject({ kind: 'redirect' });
      expect(domains.checkManagedDomainRenewal).not.toHaveBeenCalled();
    });

    it('answers PLAN_CHANGE_NOT_CONFIGURED without the portal configuration', async () => {
      delete process.env.STRIPE_PORTAL_CONFIGURATION_PLAN_CHANGE;
      const { service, stripe } = setup({ sub: subscription() });
      await expect(
        service.requestChange('user-1', 'pro', APP_URL),
      ).rejects.toBeInstanceOf(PlanChangeNotConfiguredException);
      expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    });

    it.each(['past_due', 'incomplete'])(
      'refuses a %s subscription',
      async (status) => {
        const { service } = setup({
          sub: subscription({ status: status as Stripe.Subscription.Status }),
        });
        await expect(
          service.requestChange('user-1', 'pro', APP_URL),
        ).rejects.toMatchObject({
          code: 'PLAN_CHANGE_NOT_ALLOWED',
          details: { blockers: ['SUBSCRIPTION_NOT_ACTIVE'] },
        });
      },
    );
  });

  describe('downgrade', () => {
    it('schedules Básico for the period end, preserving the current phase', async () => {
      const { service, stripe } = setup({ sub: proMonthly() });
      const result = await service.requestChange('user-1', 'basico', APP_URL);

      expect(result).toEqual({
        kind: 'scheduled',
        url: null,
        effectiveAt: new Date(PERIOD_END_S * 1000).toISOString(),
      });
      expect(stripe.subscriptionSchedules.create).toHaveBeenCalledWith({
        from_subscription: 'sub_1',
      });
      const [scheduleId, params] =
        stripe.subscriptionSchedules.update.mock.calls[0];
      expect(scheduleId).toBe('sub_sched_new');
      expect(params).toMatchObject({
        end_behavior: 'release',
        proration_behavior: 'none',
        metadata: { app: 'lattiz', purpose: 'plan_change' },
        phases: [
          { end_date: PERIOD_END_S, items: [{ price: 'price_pro_m' }] },
          {
            items: [{ price: 'price_basico_m', quantity: 1 }],
            proration_behavior: 'none',
          },
        ],
      });
    });

    it('releases the schedule when the second step fails', async () => {
      const { service, stripe } = setup({ sub: proMonthly() });
      stripe.subscriptionSchedules.update.mockRejectedValue(new Error('boom'));
      await expect(
        service.requestChange('user-1', 'basico', APP_URL),
      ).rejects.toBeInstanceOf(PlanChangeFailedException);
      expect(stripe.subscriptionSchedules.release).toHaveBeenCalledWith(
        'sub_sched_new',
      );
    });

    it('returns the existing schedule on a repeated request', async () => {
      const { service, stripe } = setup({
        sub: {
          ...proMonthly(),
          schedule: 'sub_sched_1',
        } as Stripe.Subscription,
        schedule: pendingDowngradeSchedule(),
      });
      await expect(
        service.requestChange('user-1', 'basico', APP_URL),
      ).resolves.toEqual({
        kind: 'scheduled',
        url: null,
        effectiveAt: new Date(PERIOD_END_S * 1000).toISOString(),
      });
      expect(stripe.subscriptionSchedules.create).not.toHaveBeenCalled();
    });

    it.each([
      ['above_cap', 'DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP'],
      ['price_unavailable', 'DOWNGRADE_PRICE_UNAVAILABLE'],
    ] as const)(
      'domain check %s blocks with %s',
      async (domainCheck, blocker) => {
        const { service, stripe, domains } = setup({
          sub: proMonthly(),
          domainCheck,
        });
        await expect(
          service.requestChange('user-1', 'basico', APP_URL),
        ).rejects.toMatchObject({ details: { blockers: [blocker] } });
        expect(domains.checkManagedDomainRenewal).toHaveBeenCalledWith(
          'tenant-1',
          'basico',
        );
        expect(stripe.subscriptionSchedules.create).not.toHaveBeenCalled();
      },
    );

    it('blocks a flexible-mode subscription scheduled to cancel', async () => {
      const { service } = setup({
        sub: {
          ...proMonthly(),
          cancel_at: PERIOD_END_S,
        } as Stripe.Subscription,
      });
      await expect(
        service.requestChange('user-1', 'basico', APP_URL),
      ).rejects.toMatchObject({
        details: { blockers: ['SUBSCRIPTION_CANCELING'] },
      });
    });
  });

  it('refuses a subscription that belongs to another customer', async () => {
    const { service, stripe } = setup({
      sub: subscription({ customer: 'cus_someone_else' }),
    });
    await expect(
      service.requestChange('user-1', 'pro', APP_URL),
    ).rejects.toBeInstanceOf(SubscriptionOwnershipMismatchException);
    expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
  });

  it('reports pending changes and per-target blockers', async () => {
    const { service } = setup({
      sub: { ...proMonthly(), schedule: 'sub_sched_1' } as Stripe.Subscription,
      schedule: pendingDowngradeSchedule(),
    });
    const status = await service.getStatus('user-1');
    expect(status.currentPlan).toBe('pro');
    expect(status.billingPeriod).toBe('monthly');
    expect(status.pending).toEqual({
      targetPlan: 'basico',
      effectiveAt: new Date(PERIOD_END_S * 1000).toISOString(),
    });
    const basico = status.options.find((o) => o.targetPlan === 'basico');
    expect(basico).toMatchObject({
      direction: 'downgrade',
      effective: 'period_end',
      allowed: false,
      blockers: ['PLAN_CHANGE_PENDING'],
    });
  });

  describe('releasePending', () => {
    it('releases our pending schedule', async () => {
      const { service, stripe } = setup({
        sub: {
          ...proMonthly(),
          schedule: 'sub_sched_1',
        } as Stripe.Subscription,
        schedule: pendingDowngradeSchedule(),
      });
      await expect(service.releasePending('user-1')).resolves.toEqual({
        released: true,
      });
      expect(stripe.subscriptionSchedules.release).toHaveBeenCalledWith(
        'sub_sched_1',
      );
    });

    it('answers 404 with no schedule, and refuses a schedule that is not ours', async () => {
      const none = setup({ sub: proMonthly() });
      await expect(
        none.service.releasePending('user-1'),
      ).rejects.toBeInstanceOf(NoPendingPlanChangeException);

      const foreign = setup({
        sub: {
          ...proMonthly(),
          schedule: 'sub_sched_1',
        } as Stripe.Subscription,
        schedule: pendingDowngradeSchedule({}),
      });
      await expect(
        foreign.service.releasePending('user-1'),
      ).rejects.toBeInstanceOf(NoPendingPlanChangeException);
      expect(
        foreign.stripe.subscriptionSchedules.release,
      ).not.toHaveBeenCalled();
    });
  });

  it('rejects any change without a subscription', async () => {
    const { service, stripe } = setup({
      sub: proMonthly(),
      noSubscription: true,
    });
    await expect(
      service.requestChange('user-1', 'pro', APP_URL),
    ).rejects.toMatchObject({
      details: { blockers: ['NO_ACTIVE_SUBSCRIPTION'] },
    });
    await expect(
      service.requestChange('user-1', 'pro', APP_URL),
    ).rejects.toBeInstanceOf(PlanChangeNotAllowedException);
    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  describe('template impact', () => {
    const proTemplate = {
      id: 'barberia-oxido-v1',
      name: 'ÓXIDO Barber Club',
      tier: 'pro',
    };
    const periodEndIso = new Date(PERIOD_END_S * 1000).toISOString();

    it('lists the Pro template as a loss for a downgrade, dated at the period end', async () => {
      const { service } = setup({
        sub: proMonthly(),
        currentTemplate: proTemplate,
      });
      await expect(
        service.getImpact('user-1', 'tenant-1', 'basico'),
      ).resolves.toEqual({
        target: 'basico',
        items: [
          {
            kind: 'template_loss',
            templateId: 'barberia-oxido-v1',
            templateName: 'ÓXIDO Barber Club',
            effectiveAt: periodEndIso,
          },
        ],
      });
    });

    it('reports nothing for an upgrade or a Básico template', async () => {
      const { service } = setup({
        sub: subscription(),
        currentTemplate: {
          id: 'barberia-base-claro-v1',
          name: 'TRAZO',
          tier: 'basic',
        },
      });
      await expect(
        service.getImpact('user-1', 'tenant-1', 'pro'),
      ).resolves.toEqual({
        target: 'pro',
        items: [],
      });
      const pro = setup({
        sub: proMonthly(),
        currentTemplate: {
          id: 'barberia-base-claro-v1',
          name: 'TRAZO',
          tier: 'basic',
        },
      });
      await expect(
        pro.service.getImpact('user-1', 'tenant-1', 'basico'),
      ).resolves.toEqual({ target: 'basico', items: [] });
    });

    it('refuses another tenant id', async () => {
      const { service, stripe } = setup({ sub: proMonthly() });
      await expect(
        service.getImpact('user-1', 'tenant-2', 'basico'),
      ).rejects.toBeInstanceOf(BillingTenantAccessDeniedException);
      expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it('answers 409 with the impact until the loss is acknowledged, scheduling nothing', async () => {
      const { service, stripe } = setup({
        sub: proMonthly(),
        currentTemplate: proTemplate,
      });
      const attempt = service.requestChange('user-1', 'basico', APP_URL);
      await expect(attempt).rejects.toBeInstanceOf(
        PlanChangeImpactNotAcknowledgedException,
      );
      await expect(attempt).rejects.toMatchObject({
        status: 409,
        code: 'PLAN_CHANGE_IMPACT_NOT_ACKNOWLEDGED',
        details: {
          items: [
            expect.objectContaining({
              kind: 'template_loss',
              effectiveAt: periodEndIso,
            }),
          ],
        },
      });
      expect(stripe.subscriptionSchedules.create).not.toHaveBeenCalled();
    });

    it('schedules the downgrade once acknowledged', async () => {
      const { service, stripe } = setup({
        sub: proMonthly(),
        currentTemplate: proTemplate,
      });
      await expect(
        service.requestChange('user-1', 'basico', APP_URL, true),
      ).resolves.toEqual({
        kind: 'scheduled',
        url: null,
        effectiveAt: periodEndIso,
      });
      expect(stripe.subscriptionSchedules.create).toHaveBeenCalledTimes(1);
    });

    it('needs no acknowledgement when nothing is lost', async () => {
      const { service, stripe } = setup({
        sub: proMonthly(),
        currentTemplate: {
          id: 'barberia-base-claro-v1',
          name: 'TRAZO',
          tier: 'basic',
        },
      });
      await service.requestChange('user-1', 'basico', APP_URL);
      expect(stripe.subscriptionSchedules.create).toHaveBeenCalledTimes(1);
    });
  });
});
