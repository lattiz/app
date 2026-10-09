import type { DomainPriceCaps } from './domain/domain-pricing.policy';

/**
 * Reads the domain price caps from env. Throws on a missing/invalid value so
 * the API fails at boot instead of pricing domains against a guessed cap.
 */
export function parseDomainPriceCaps(
  get: (key: string) => string | undefined,
): DomainPriceCaps {
  const caps: DomainPriceCaps = {
    purchaseUsdCents: requirePositiveInt(get, 'DOMAIN_MAX_COST_USD_CENTS'),
    basicRenewalUsdCents: requirePositiveInt(
      get,
      'BASIC_DOMAIN_MAX_COST_USD_CENTS',
    ),
    proRenewalUsdCents: requirePositiveInt(
      get,
      'PRO_DOMAIN_MAX_COST_USD_CENTS',
    ),
  };
  if (caps.basicRenewalUsdCents > caps.proRenewalUsdCents) {
    throw new Error(
      'BASIC_DOMAIN_MAX_COST_USD_CENTS must be <= PRO_DOMAIN_MAX_COST_USD_CENTS.',
    );
  }
  return caps;
}

function requirePositiveInt(
  get: (key: string) => string | undefined,
  key: string,
): number {
  const raw = get(key)?.trim() ?? '';
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
    throw new Error(`${key} must be set to a positive integer (USD cents).`);
  }
  return Number(raw);
}
