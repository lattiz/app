import { Logger } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { Database } from '../../database/database.module';
import type { EmailOutboxService } from '../email/application/email-outbox.service';
import type { DomainRenewalConfig } from './domain-renewal.config';
import type { DomainRenewalPaymentService } from './domain-renewal-payment.service';
import type { DnsZoneInspectionPort } from './domain/dns-provider.port';
import type { DomainPriceCaps } from './domain/domain-pricing.policy';
import { RENEWAL_DAY_MS } from './domain/domain-renewal.policy';
import type { EffectivePlanPort } from './domain/effective-plan.port';
import type { RegistrarPort } from './domain/registrar.port';
import { DOMAIN_INSPECT_TIMEOUT_MS } from './domain-inspection';
import { DomainsService } from './domains.service';
import type { VercelDomainsService } from './vercel-domains.service';

const dialect = new PgDialect();
const TENANT = '11111111-1111-4111-8111-111111111111';
const DOMAIN_ID = '22222222-2222-4222-8222-222222222222';
const NOW = new Date('2026-10-17T18:00:00.000Z');
const EXPIRES = new Date('2026-11-16T18:00:00.000Z');
const PURCHASE = '2026-01-10T15:00:00.000Z';
const DAY = RENEWAL_DAY_MS;

const caps: DomainPriceCaps = {
  purchaseUsdCents: 2200,
  basicRenewalUsdCents: 2367,
  proRenewalUsdCents: 4200,
};

interface DomainFixture {
  id: string;
  tenant_id: string;
  domain: string;
  source: 'lattiz_managed' | 'user_provided';
  tld: string;
  registrar_domain_id: string | null;
  annual_cost_usd_cents: number;
  period_years: number;
  expires_at: string | null;
  dns_status: string;
  vercel_domain_id: string | null;
  vercel_mapped: boolean;
  ssl_active: boolean;
  is_mock: boolean;
  purchase_completed_at: string | null;
  suspended_at: string | null;
  released_at: string | null;
  dns_provider: string | null;
  dns_zone_id: string | null;
  dns_activation_checked_at: string | null;
}

function domainRow(overrides: Partial<DomainFixture> = {}): DomainFixture {
  return {
    id: DOMAIN_ID,
    tenant_id: TENANT,
    domain: 'cafe.mx',
    source: 'lattiz_managed',
    tld: '.mx',
    registrar_domain_id: 'op-1',
    annual_cost_usd_cents: 1200,
    period_years: 1,
    expires_at: EXPIRES.toISOString(),
    dns_status: 'active',
    vercel_domain_id: 'vercel-1',
    vercel_mapped: true,
    ssl_active: true,
    is_mock: false,
    purchase_completed_at: PURCHASE,
    suspended_at: null,
    released_at: null,
    dns_provider: 'cloudflare',
    dns_zone_id: 'zone-1',
    dns_activation_checked_at: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

function matchingZone() {
  return {
    exists: true,
    zoneId: 'zone-1',
    status: 'active',
    nameservers: ['ns1.cloudflare.com'],
    originalNameservers: ['ns1.openprovider.nl'],
    activatedOn: '2026-01-02T00:00:00.000Z',
    paused: false,
    records: [
      {
        type: 'A',
        name: 'cafe.mx',
        content: '76.76.21.21',
        proxied: false,
      },
      {
        type: 'CNAME',
        name: 'www.cafe.mx',
        content: 'cname.vercel-dns.com',
        proxied: false,
      },
    ],
  };
}

interface HarnessOptions {
  domain?: DomainFixture | null;
  plan?: string;
  includedAt?: string | null;
  cycles?: Array<Record<string, unknown>>;
  renewalDate?: Date | null;
  hangDns?: boolean;
  dnsError?: Error;
  currentCycle?: Record<string, unknown> | null;
}

function create(options: HarnessOptions = {}) {
  const calls: string[] = [];
  const db = {
    execute: jest.fn(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql.replace(/\s+/g, ' ');
      if (text.includes('FROM public.domains')) {
        calls.push('domain');
        if (options.domain === null) return [];
        return [options.domain ?? domainRow()];
      }
      if (text.includes('FROM public.tenants')) {
        calls.push('tenant');
        return [
          {
            plan: options.plan ?? 'basico',
            included_domain_used_at:
              options.includedAt === undefined ? PURCHASE : options.includedAt,
          },
        ];
      }
      if (text.includes('domain_maintenance_cycles')) {
        calls.push('cycles');
        return options.cycles ?? [];
      }
      throw new Error(`unexpected SQL: ${text}`);
    }),
  };
  const registrar = {
    getLifecycle: jest.fn().mockResolvedValue({
      status: 'active',
      renewalDate:
        options.renewalDate === undefined
          ? new Date(EXPIRES.getTime() + 2 * DAY)
          : options.renewalDate,
      canRenew: true,
      restorableUntil: new Date('2026-12-20T00:00:00.000Z'),
    }),
    getAutoRenew: jest.fn().mockResolvedValue('off'),
  };
  const inspection: jest.Mocked<Pick<DnsZoneInspectionPort, 'inspectZone'>> = {
    inspectZone: jest.fn(),
  };
  if (options.hangDns) {
    inspection.inspectZone.mockReturnValue(new Promise(() => undefined));
  } else if (options.dnsError) {
    inspection.inspectZone.mockRejectedValue(options.dnsError);
  } else {
    inspection.inspectZone.mockResolvedValue(matchingZone());
  }
  const vercel = {
    hasDomain: jest.fn().mockResolvedValue(true),
    isDomainConfigured: jest.fn().mockResolvedValue(true),
    getDnsTargets: jest.fn().mockResolvedValue({
      ipv4: '76.76.21.21',
      cname: 'cname.vercel-dns.com',
    }),
  };
  const renewalPayments = {
    getStatusForTenant: jest
      .fn()
      .mockResolvedValue(options.currentCycle ?? null),
  };
  const renewalConfig = {
    openDaysBefore: 28,
    noticeDaysBefore: [28, 14, 7],
    lateDays: 15,
    taxRateBps: 1600,
    feeMxnCents: (plan: string) => (plan === 'pro' ? 79900 : 59900),
  } as unknown as DomainRenewalConfig;

  const service = new DomainsService(
    db as unknown as Database,
    registrar as unknown as RegistrarPort,
    { provider: 'cloudflare' } as never,
    vercel as unknown as VercelDomainsService,
    {} as EmailOutboxService,
    caps,
    { effectivePlanFor: jest.fn() } as EffectivePlanPort,
    renewalConfig,
    inspection as DnsZoneInspectionPort,
    renewalPayments as unknown as DomainRenewalPaymentService,
  );

  return { service, db, registrar, inspection, vercel, renewalPayments, calls };
}

describe('DomainsService.inspectForTenant', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('counts calendar days in Mexico City and builds the renewal schedule', async () => {
    const longError = 'x'.repeat(300);
    const { service } = create({
      plan: 'pro',
      cycles: [
        {
          status: 'open',
          amount_cents: '69484',
          currency: 'mxn',
          opened_at: '2026-10-19T18:00:00.000Z',
          paid_at: null,
          renewed_at: null,
          overdue_at: null,
          lapsed_at: null,
          last_error: `  ${longError}  `,
        },
      ],
      currentCycle: {
        domain: 'cafe.mx',
        status: 'open',
        expiresAt: EXPIRES.toISOString(),
        lateDeadlineAt: null,
        baseCents: 79900,
        taxCents: 12784,
        totalCents: 92684,
        currency: 'mxn',
        canPay: true,
        payBlockedReason: null,
      },
    });

    const body = await service.inspectForTenant(TENANT, NOW);
    const renewal = body.renewal;
    if (!renewal || !('expectedChargeCents' in renewal)) {
      throw new Error('expected a managed renewal');
    }

    expect(body.domain).toMatchObject({
      name: 'cafe.mx',
      source: 'lattiz_managed',
      dnsProvider: 'cloudflare',
      dnsActivationCheckedAt: '2026-10-01T00:00:00.000Z',
      isMock: false,
      purchaseCompletedAt: new Date(PURCHASE).toISOString(),
    });
    expect(renewal.daysUntilExpiry).toBe(30);
    expect(renewal.paymentOpensAt).toBe('2026-10-19T18:00:00.000Z');
    expect(renewal.daysUntilPaymentOpens).toBe(2);
    expect(renewal.noticeDates).toEqual([
      '2026-10-19T18:00:00.000Z',
      '2026-11-02T18:00:00.000Z',
      '2026-11-09T18:00:00.000Z',
    ]);
    expect(renewal.lateDeadlineAt).toBe('2026-12-01T18:00:00.000Z');
    expect(renewal.expectedChargeCents).toBe(92684);
    expect(renewal.currency).toBe('mxn');
    expect(renewal.firstYearIncluded).toBe(true);
    expect(renewal.currentCycle).toMatchObject({ status: 'open', canPay: true });
    expect(renewal.cycles).toEqual([
      {
        status: 'open',
        amountCents: 69484,
        currency: 'mxn',
        openedAt: '2026-10-19T18:00:00.000Z',
        paidAt: null,
        renewedAt: null,
        overdueAt: null,
        lapsedAt: null,
        lastError: 'x'.repeat(240),
      },
    ]);
  });

  it('uses the Mexico City calendar across the UTC date line', async () => {
    const { service } = create({
      domain: domainRow({
        expires_at: '2026-10-17T06:30:00.000Z',
      }),
    });
    const body = await service.inspectForTenant(
      TENANT,
      new Date('2026-10-17T05:30:00.000Z'),
    );
    const renewal = body.renewal;
    if (!renewal || !('daysUntilExpiry' in renewal)) {
      throw new Error('expected a managed renewal');
    }
    expect(renewal.daysUntilExpiry).toBe(1);
  });

  it('flags a registrar expiry more than a day away from the stored one', async () => {
    const mismatch = await create().service.inspectForTenant(TENANT, NOW);
    expect(mismatch.registrar).toMatchObject({
      status: 'active',
      autoRenew: 'off',
      canRenew: true,
      expiryMismatch: true,
      restorableUntil: '2026-12-20T00:00:00.000Z',
    });

    const close = await create({
      renewalDate: new Date(EXPIRES.getTime() + 12 * 60 * 60 * 1000),
    }).service.inspectForTenant(TENANT, NOW);
    expect(close.registrar).toMatchObject({ expiryMismatch: false });
  });

  it('matches apex and www records against the Vercel targets', async () => {
    const matched = await create().service.inspectForTenant(TENANT, NOW);
    expect(matched.dns).toMatchObject({
      exists: true,
      recordsMatchVercel: true,
    });

    const { service, inspection } = create();
    inspection.inspectZone.mockResolvedValue({
      ...matchingZone(),
      records: [
        {
          type: 'A',
          name: 'cafe.mx',
          content: '1.2.3.4',
          proxied: false,
        },
        {
          type: 'CNAME',
          name: 'www.cafe.mx',
          content: 'cname.vercel-dns.com',
          proxied: true,
        },
      ],
    });
    const drifted = await service.inspectForTenant(TENANT, NOW);
    expect(drifted.dns).toMatchObject({ recordsMatchVercel: false });
  });

  it('keeps the other providers when one fails', async () => {
    const { service, registrar } = create({
      dnsError: new Error('cloudflare down'),
    });
    registrar.getLifecycle.mockRejectedValue(new Error('registrar down'));
    const body = await service.inspectForTenant(TENANT, NOW);
    expect(body.registrar).toEqual({ error: 'unavailable' });
    expect(body.dns).toEqual({ error: 'unavailable' });
    expect(body.vercel).toEqual({ inProject: true, configured: true });
    expect(body.domain?.name).toBe('cafe.mx');
  });

  it('does not let a hung provider block the others', async () => {
    jest.useFakeTimers();
    const { service } = create({ hangDns: true });
    const pending = service.inspectForTenant(TENANT, NOW);
    await jest.advanceTimersByTimeAsync(DOMAIN_INSPECT_TIMEOUT_MS);
    const body = await pending;
    expect(body.dns).toEqual({ error: 'unavailable' });
    expect(body.vercel).toEqual({ inProject: true, configured: true });
    expect(body.registrar).toMatchObject({ status: 'active' });
  });

  it('marks a customer-owned domain as unmanaged and skips the registrar', async () => {
    const { service, registrar, calls } = create({
      domain: domainRow({
        source: 'user_provided',
        registrar_domain_id: null,
        expires_at: null,
      }),
    });
    const body = await service.inspectForTenant(TENANT, NOW);
    expect(body.renewal).toEqual({ managedBy: 'customer' });
    expect(body.registrar).toBeNull();
    expect(body.dns).toMatchObject({ exists: true });
    expect(registrar.getLifecycle).not.toHaveBeenCalled();
    expect(calls).toEqual(['domain']);
  });

  it('returns an empty inspection when the tenant has no live domain', async () => {
    const missing = create({ domain: null });
    await expect(missing.service.inspectForTenant(TENANT, NOW)).resolves.toEqual({
      domain: null,
      renewal: null,
      registrar: null,
      dns: null,
      vercel: null,
    });
    expect(missing.inspection.inspectZone).not.toHaveBeenCalled();

    const released = create({
      domain: domainRow({ released_at: '2026-09-01T00:00:00.000Z' }),
    });
    const body = await released.service.inspectForTenant(TENANT, NOW);
    expect(body.domain).toBeNull();
    expect(released.registrar.getLifecycle).not.toHaveBeenCalled();
  });
});
