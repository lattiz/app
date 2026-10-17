import type Stripe from 'stripe';
import type { Database } from '../../../database/database.module';
import type { PreviewConfig } from '../../../common/billing/preview.config';
import type { SettingsService } from '../../../common/settings/settings.service';
import { AdminStripeUnavailableException } from '../admin.exceptions';
import { AdminMetricsService } from './admin-metrics.service';

function service(): AdminMetricsService {
  const stripe = {
    subscriptions: {
      list: () => {
        throw new Error('stripe down');
      },
    },
    balanceTransactions: {
      list: () => {
        throw new Error('stripe down');
      },
    },
  };
  return new AdminMetricsService(
    { execute: async () => [] } as unknown as Database,
    stripe as unknown as Stripe,
    { getInt: () => 1600 } as unknown as SettingsService,
    { enabled: true, trialDays: 7 } as unknown as PreviewConfig,
  );
}

describe('AdminMetricsService stripe failures', () => {
  it('returns the rest of the overview when MRR cannot be loaded', async () => {
    const overview = await service().overview(
      new Date('2026-10-17T12:00:00.000Z'),
    );
    expect(overview.revenueError).toBe('unavailable');
    expect(overview.mrrCents).toBeNull();
    expect(overview.arrCents).toBeNull();
    expect(overview.currency).toBeNull();
    expect(overview.mrrByCurrency).toEqual([]);
    expect(overview.customers.payingTenants).toBe(0);
    expect(overview.customers.churnRateThisMonth).toBeNull();
    expect(overview.product.publishedSites).toBe(0);
    expect(overview.generatedAt).toBe('2026-10-17T12:00:00.000Z');
  });

  it('rejects the revenue series with ADMIN_STRIPE_UNAVAILABLE', async () => {
    await expect(service().revenue(12)).rejects.toBeInstanceOf(
      AdminStripeUnavailableException,
    );
  });
});
