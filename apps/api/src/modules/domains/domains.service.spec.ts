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
  getDomainByTenant(tenantId: string): Promise<{
    domain: string;
    released_at: null;
    purchase_completed_at: null;
  } | null>;
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
      [2200, true, null],
      [2201, false, 'purchase_over_cap'],
    ])('quote at %p → coveredByPlan=%p', async (price, covered, reason) => {
      const { service } = setup({ create: price, renew: price });
      const quote = await service.getQuote('user-1', DOMAIN);
      expect(quote.coveredByPlan).toBe(covered);
      expect(quote.notCoveredReason).toBe(reason);
      expect(quote.availableWithPro).toBe(false);
    });

    it.each([
      [2200, true, null],
      [2201, false, 'purchase_over_cap'],
    ])('search at %p → coveredByPlan=%p', async (price, covered, reason) => {
      const { service } = setup({ create: price, renew: price });
      const results = await service.searchDomains('user-1', 'mi negocio');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.coveredByPlan === covered)).toBe(true);
      expect(results.every((r) => r.notCoveredReason === reason)).toBe(true);
      expect(results.every((r) => r.availableWithPro === false)).toBe(true);
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

  describe('purchase-time renewal cap', () => {
    it.each([
      ['basico', 2367],
      ['pro', 4200],
    ])('%p renewing at %p is allowed', async (plan, renew) => {
      const { service, runPipeline } = setup({ create: 1500, renew }, plan);
      await expect(
        service.initiatePurchase('user-1', PURCHASE),
      ).resolves.toEqual({
        jobId: 'job-1',
      });
      expect(runPipeline).toHaveBeenCalledTimes(1);
      expect(renewalWarnings()).toHaveLength(0);
    });

    it.each([
      ['basico', 3000, 2367, 'requires_pro'],
      ['basico', 2368, 2367, 'requires_pro'],
      ['basico', 6000, 2367, 'renewal_over_cap'],
      ['pro', 4201, 4200, 'renewal_over_cap'],
      ['none', 2368, 2367, 'requires_pro'],
    ] as const)(
      '%p renewing at %p is blocked at cap %p (%p)',
      async (plan, renew, cap, reason) => {
        const { service, discardJob, createDomainRecord, runPipeline } = setup(
          { create: 1500, renew },
          plan,
        );
        await expect(
          service.initiatePurchase('user-1', PURCHASE),
        ).rejects.toMatchObject({
          code: 'DOMAIN_NOT_COVERED_BY_PLAN',
          details: { reason },
        });
        expect(renewalWarnings()[0][0]).toBe(
          `[DOMAIN_RENEWAL_ABOVE_PLAN_CAP] tenant=${TENANT_ID} domain=${DOMAIN} plan=${plan} renewal_usd_cents=${renew} cap_usd_cents=${cap}`,
        );
        expect(discardJob).toHaveBeenCalledWith('job-1');
        expect(createDomainRecord).not.toHaveBeenCalled();
        expect(runPipeline).not.toHaveBeenCalled();
      },
    );

    it('does not block a purchase that is already registered', async () => {
      const { service, registrar, createDomainRecord, runPipeline } = setup({
        create: 1500,
        renew: 6000,
      });
      const internals = service as unknown as PurchaseInternals;
      jest.spyOn(internals, 'getDomainByTenant').mockResolvedValue({
        domain: DOMAIN,
        released_at: null,
        purchase_completed_at: null,
      });
      registrar.findDomain.mockResolvedValue({
        id: 'reg-1',
        status: 'active',
        renewalDate: new Date('2027-01-01T00:00:00.000Z'),
      });

      await expect(
        service.initiatePurchase('user-1', PURCHASE),
      ).resolves.toEqual({
        jobId: 'job-1',
      });
      expect(registrar.getPriceUsdCents).not.toHaveBeenCalled();
      expect(createDomainRecord).not.toHaveBeenCalled();
      expect(runPipeline).toHaveBeenCalledTimes(1);
      expect(renewalWarnings()).toHaveLength(0);
    });
  });

  describe('renewal cap on search and quote', () => {
    it.each([
      ['basico', 3000, false, 'requires_pro', true],
      ['basico', 6000, false, 'renewal_over_cap', false],
      ['pro', 3000, true, null, false],
      ['pro', 6000, false, 'renewal_over_cap', false],
      ['pro', 4000, true, null, false],
      ['basico', 2000, true, null, false],
    ] as const)(
      '%p renewal %p → covered=%p reason=%p availableWithPro=%p',
      async (plan, renew, covered, reason, availableWithPro) => {
        const { service } = setup({ create: 1700, renew }, plan);
        const results = await service.searchDomains('user-1', 'massari');
        expect(results.every((r) => r.available)).toBe(true);
        expect(results.every((r) => r.coveredByPlan === covered)).toBe(true);
        expect(results.every((r) => r.notCoveredReason === reason)).toBe(true);
        expect(results.every((r) => r.availableWithPro === availableWithPro)).toBe(
          true,
        );

        const quote = await service.getQuote('user-1', 'massari.com');
        expect(quote.coveredByPlan).toBe(covered);
        expect(quote.notCoveredReason).toBe(reason);
        expect(quote.availableWithPro).toBe(availableWithPro);
      },
    );

    it('fails closed when the renewal price cannot be read', async () => {
      const { service, registrar } = setup({ create: 1700, renew: 2000 });
      registrar.getPriceUsdCents.mockImplementation((_domain, op) => {
        if (op === 'renew') return Promise.reject(new Error('429'));
        return Promise.resolve(1700);
      });

      const results = await service.searchDomains('user-1', 'massari');
      expect(results.every((r) => r.coveredByPlan === false)).toBe(true);
      expect(results.every((r) => r.notCoveredReason === 'price_unknown')).toBe(
        true,
      );
      expect(results.every((r) => r.availableWithPro === false)).toBe(true);
      expect(
        warn.mock.calls.filter(([msg]) =>
          String(msg).includes('Renewal price lookup failed'),
        ),
      ).toHaveLength(results.length);

      const quote = await service.getQuote('user-1', 'massari.com');
      expect(quote.coveredByPlan).toBe(false);
      expect(quote.notCoveredReason).toBe('price_unknown');
      expect(quote.availableWithPro).toBe(false);
    });

    it('does not call the registrar again for a cached renewal price', async () => {
      const { service, registrar } = setup({ create: 1700, renew: 2000 });
      await service.searchDomains('user-1', 'massari');
      const renewCalls = () =>
        registrar.getPriceUsdCents.mock.calls.filter(([, op]) => op === 'renew')
          .length;
      const first = renewCalls();
      expect(first).toBe(5);
      await service.searchDomains('user-1', 'massari');
      expect(renewCalls()).toBe(first);
    });

    it('looks up renewal prices at most two at a time', async () => {
      let inFlight = 0;
      let maxInFlight = 0;
      const { service, registrar } = setup({ create: 1700, renew: 2000 });
      registrar.getPriceUsdCents.mockImplementation(async (_domain, op) => {
        if (op !== 'renew') return 1700;
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 20));
        inFlight -= 1;
        return 2000;
      });

      const results = await service.searchDomains('user-1', 'massari');
      expect(results).toHaveLength(5);
      expect(maxInFlight).toBe(2);
      expect(
        registrar.getPriceUsdCents.mock.calls.filter(([, op]) => op === 'renew'),
      ).toHaveLength(5);
    });
  });
});
