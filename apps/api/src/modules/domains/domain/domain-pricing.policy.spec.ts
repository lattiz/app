import {
  type DomainPriceCaps,
  evaluateDomainPurchase,
  isPurchaseWithinCap,
  resolveEffectivePlan,
  isRenewalWithinCap,
  resolveRenewalCapUsdCents,
} from './domain-pricing.policy';

const caps: DomainPriceCaps = {
  purchaseUsdCents: 2200,
  basicRenewalUsdCents: 2367,
  proRenewalUsdCents: 4200,
};

describe('domain pricing policy', () => {
  describe('resolveRenewalCapUsdCents', () => {
    it('uses the Pro cap for pro', () => {
      expect(resolveRenewalCapUsdCents('pro', caps)).toBe(4200);
    });

    it.each(['basico', 'none', 'trial', 'PRO', 'enterprise', null])(
      'fails closed to the Básico cap for %p',
      (plan) => {
        expect(resolveRenewalCapUsdCents(plan, caps)).toBe(2367);
      },
    );
  });

  describe('isRenewalWithinCap', () => {
    it.each([
      ['basico', 2367, true],
      ['basico', 2368, false],
      ['pro', 4200, true],
      ['pro', 4201, false],
      [null, 2368, false],
    ])('%p at %p → allowed=%p', (plan, price, allowed) => {
      expect(isRenewalWithinCap(plan, price, caps).allowed).toBe(allowed);
    });

    it('reports the cap it compared against', () => {
      expect(isRenewalWithinCap('pro', 5000, caps)).toEqual({
        allowed: false,
        capUsdCents: 4200,
      });
    });
  });

  describe('isPurchaseWithinCap', () => {
    it('allows exactly the cap and rejects one cent over', () => {
      expect(isPurchaseWithinCap(2200, caps.purchaseUsdCents)).toBe(true);
      expect(isPurchaseWithinCap(2201, caps.purchaseUsdCents)).toBe(false);
    });
  });
});

describe('evaluateDomainPurchase', () => {
  const evaluate = (
    firstYearUsdCents: number | null,
    renewalUsdCents: number | null,
    plan: string | null,
  ) =>
    evaluateDomainPurchase({ firstYearUsdCents, renewalUsdCents, plan, caps });

  it.each([
    [2200, 2000, 'basico', { allowed: true }],
    [2201, 2000, 'pro', { allowed: false, reason: 'purchase_over_cap' }],
    [1500, 2367, 'basico', { allowed: true }],
    [1500, 2368, 'basico', { allowed: false, reason: 'requires_pro' }],
    [1500, 2368, 'pro', { allowed: true }],
    [1500, 4200, 'pro', { allowed: true }],
    [1500, 4201, 'pro', { allowed: false, reason: 'renewal_over_cap' }],
    [1500, 4201, 'basico', { allowed: false, reason: 'renewal_over_cap' }],
    [1500, null, 'pro', { allowed: false, reason: 'price_unknown' }],
    [null, 2000, 'pro', { allowed: false, reason: 'price_unknown' }],
    [1500, 2368, 'none', { allowed: false, reason: 'requires_pro' }],
  ])('first year %p, renewal %p on %p', (first, renewal, plan, expected) => {
    expect(evaluate(first, renewal, plan)).toEqual(expected);
  });
});

describe('resolveEffectivePlan', () => {
  it.each([
    ['pro', 'basico', 'basico'],
    ['pro', null, 'pro'],
    ['pro', 'pro', 'pro'],
    ['basico', 'pro', 'basico'],
    ['basico', null, 'basico'],
    [null, null, null],
  ])('%p with pending %p → %p', (current, pending, expected) => {
    expect(resolveEffectivePlan(current, pending)).toBe(expected);
  });
});
