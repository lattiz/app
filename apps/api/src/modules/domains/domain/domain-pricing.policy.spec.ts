import {
  type DomainPriceCaps,
  isPurchaseWithinCap,
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
