import { parseDomainPriceCaps } from './domain-pricing.config';

const VALID: Record<string, string> = {
  DOMAIN_MAX_COST_USD_CENTS: '2200',
  BASIC_DOMAIN_MAX_COST_USD_CENTS: '2367',
  PRO_DOMAIN_MAX_COST_USD_CENTS: '4200',
};

const parse = (env: Record<string, string | undefined>) =>
  parseDomainPriceCaps((key) => env[key]);

describe('parseDomainPriceCaps', () => {
  it('reads the three caps', () => {
    expect(parse(VALID)).toEqual({
      purchaseUsdCents: 2200,
      basicRenewalUsdCents: 2367,
      proRenewalUsdCents: 4200,
    });
  });

  it.each(Object.keys(VALID))('fails when %s is missing', (key) => {
    expect(() => parse({ ...VALID, [key]: undefined })).toThrow(
      `${key} must be set to a positive integer`,
    );
  });

  it.each(['', 'abc', '12.5', '0', '-100', '2200usd'])(
    'fails on a non-positive-integer value %p',
    (value) => {
      expect(() =>
        parse({ ...VALID, BASIC_DOMAIN_MAX_COST_USD_CENTS: value }),
      ).toThrow('BASIC_DOMAIN_MAX_COST_USD_CENTS must be set');
    },
  );

  it('fails when BASIC > PRO', () => {
    expect(() =>
      parse({
        ...VALID,
        BASIC_DOMAIN_MAX_COST_USD_CENTS: '4201',
        PRO_DOMAIN_MAX_COST_USD_CENTS: '4200',
      }),
    ).toThrow('BASIC_DOMAIN_MAX_COST_USD_CENTS must be <= PRO');
  });

  it('accepts BASIC === PRO', () => {
    expect(
      parse({ ...VALID, BASIC_DOMAIN_MAX_COST_USD_CENTS: '4200' })
        .basicRenewalUsdCents,
    ).toBe(4200);
  });

  it('ignores the retired DOMAIN_MAX_RENEWAL_COST_USD_CENTS', () => {
    expect(parse({ ...VALID, DOMAIN_MAX_RENEWAL_COST_USD_CENTS: '1' })).toEqual(
      parse(VALID),
    );
    expect(() =>
      parse({
        DOMAIN_MAX_COST_USD_CENTS: '2200',
        DOMAIN_MAX_RENEWAL_COST_USD_CENTS: '2800',
      }),
    ).toThrow('BASIC_DOMAIN_MAX_COST_USD_CENTS must be set');
  });
});
