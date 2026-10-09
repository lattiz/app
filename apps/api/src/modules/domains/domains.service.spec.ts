import { Logger } from '@nestjs/common';
import type { Database } from '../../database/database.module';
import type { EmailOutboxService } from '../email/application/email-outbox.service';
import type { DnsProviderPort } from './domain/dns-provider.port';
import type { DomainPriceCaps } from './domain/domain-pricing.policy';
import type { RegistrarPort } from './domain/registrar.port';
import { DomainNotCoveredByPlanException } from './domains.exceptions';
import { DomainsService } from './domains.service';
import type { VercelDomainsService } from './vercel-domains.service';

const caps: DomainPriceCaps = {
  purchaseUsdCents: 2200,
  basicRenewalUsdCents: 2367,
  proRenewalUsdCents: 4200,
};

const DOMAIN = 'mi-negocio.com';
const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const PURCHASE = {
  domain: DOMAIN,
  agreementTypes: ['LATTIZ_PRIVACY', 'LATTIZ_TERMS'],
  agreedAt: '2026-10-09T00:00:00.000Z',
};

// Private DB helpers the purchase path calls — stubbed so tests cover only the pricing decisions.
interface PurchaseInternals {
  getTenantIdByUserSub(userSub: string): Promise<string>;
  claimPurchaseJob(
    tenantId: string,
    domain: string,
  ): Promise<{ created: boolean; jobId: string }>;
  discardJob(jobId: string): Promise<void>;
  getDomainByTenant(tenantId: string): Promise<null>;
  createDomainRecord(params: unknown): Promise<void>;
  runPurchasePipeline(...args: unknown[]): Promise<void>;
}

function setup(prices: { create: number; renew: number }, plan = 'basico') {
  const registrar: jest.Mocked<RegistrarPort> = {
    isMockMode: true,
    checkAvailability: jest
      .fn()
      .mockResolvedValue({ available: true, priceUsdCents: prices.create }),
    getPriceUsdCents: jest.fn((_domain: string, op: 'create' | 'renew') =>
      Promise.resolve(op === 'create' ? prices.create : prices.renew),
    ),
    findDomain: jest.fn().mockResolvedValue(null),
    registerDomain: jest.fn(),
    getRegistrationStatus: jest.fn(),
    setNameservers: jest.fn(),
  };
  // Only the tenant-plan lookup reaches the DB; every other helper is stubbed below.
  const db = { execute: jest.fn().mockResolvedValue([{ plan }]) };

  const service = new DomainsService(
    db as unknown as Database,
    registrar,
    {} as DnsProviderPort,
    {} as VercelDomainsService,
    {} as EmailOutboxService,
    caps,
  );
  const internals = service as unknown as PurchaseInternals;
  jest.spyOn(internals, 'getTenantIdByUserSub').mockResolvedValue(TENANT_ID);
  jest
    .spyOn(internals, 'claimPurchaseJob')
    .mockResolvedValue({ created: true, jobId: 'job-1' });
  jest.spyOn(internals, 'getDomainByTenant').mockResolvedValue(null);
  const discardJob = jest
    .spyOn(internals, 'discardJob')
    .mockResolvedValue(undefined);
  const createDomainRecord = jest
    .spyOn(internals, 'createDomainRecord')
    .mockResolvedValue(undefined);
  const runPipeline = jest
    .spyOn(internals, 'runPurchasePipeline')
    .mockResolvedValue(undefined);

  return { service, registrar, discardJob, createDomainRecord, runPipeline };
}

describe('DomainsService pricing caps', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  const renewalWarnings = () =>
    warn.mock.calls.filter(([msg]) =>
      String(msg).startsWith('[DOMAIN_RENEWAL_ABOVE_PLAN_CAP]'),
    );

  describe('quote and search', () => {
    it.each([
      [2200, true],
      [2201, false],
    ])('quote at %p → coveredByPlan=%p', async (price, covered) => {
      const { service } = setup({ create: price, renew: price });
      const quote = await service.getQuote(DOMAIN);
      expect(quote.coveredByPlan).toBe(covered);
    });

    it.each([
      [2200, true],
      [2201, false],
    ])('search at %p → coveredByPlan=%p', async (price, covered) => {
      const { service } = setup({ create: price, renew: price });
      const results = await service.searchDomains('mi negocio');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.coveredByPlan === covered)).toBe(true);
    });
  });

  describe('purchase', () => {
    it('allows a first-year price of exactly 2200', async () => {
      const { service, createDomainRecord, runPipeline } = setup({
        create: 2200,
        renew: 2000,
      });
      await expect(
        service.initiatePurchase('user-1', PURCHASE),
      ).resolves.toEqual({
        jobId: 'job-1',
      });
      expect(createDomainRecord).toHaveBeenCalledTimes(1);
      expect(runPipeline).toHaveBeenCalledTimes(1);
    });

    it('rejects 2201 against a fresh server quote and discards the job', async () => {
      const {
        service,
        registrar,
        discardJob,
        createDomainRecord,
        runPipeline,
      } = setup({ create: 2201, renew: 2000 });
      await expect(
        service.initiatePurchase('user-1', PURCHASE),
      ).rejects.toBeInstanceOf(DomainNotCoveredByPlanException);
      expect(registrar.getPriceUsdCents).toHaveBeenCalledWith(DOMAIN, 'create');
      expect(discardJob).toHaveBeenCalledWith('job-1');
      expect(createDomainRecord).not.toHaveBeenCalled();
      expect(runPipeline).not.toHaveBeenCalled();
    });
  });

  describe('purchase-time renewal check (non-blocking)', () => {
    it.each([
      ['basico', 2367, false],
      ['basico', 2368, true],
      ['pro', 4200, false],
      ['pro', 4201, true],
      ['none', 2368, true],
    ])(
      '%p renewing at %p → warns=%p, never blocks',
      async (plan, renew, warns) => {
        const { service, runPipeline } = setup({ create: 1500, renew }, plan);
        await expect(
          service.initiatePurchase('user-1', PURCHASE),
        ).resolves.toEqual({
          jobId: 'job-1',
        });
        expect(runPipeline).toHaveBeenCalledTimes(1);
        expect(renewalWarnings()).toHaveLength(warns ? 1 : 0);
      },
    );

    it('logs ids and amounts only', async () => {
      const { service } = setup({ create: 1500, renew: 2368 });
      await service.initiatePurchase('user-1', PURCHASE);
      expect(renewalWarnings()[0][0]).toBe(
        `[DOMAIN_RENEWAL_ABOVE_PLAN_CAP] tenant=${TENANT_ID} domain=${DOMAIN} plan=basico renewal_usd_cents=2368 cap_usd_cents=2367`,
      );
    });
  });
});
