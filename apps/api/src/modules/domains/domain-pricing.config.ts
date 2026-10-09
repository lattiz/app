import { Logger } from '@nestjs/common';
import type { IntKey } from '../../common/settings/settings.registry';
import { SettingsService } from '../../common/settings/settings.service';
import type { DomainPriceCaps } from './domain/domain-pricing.policy';

const capsLogger = new Logger('DomainPriceCaps');

const CAP_SETTING = {
  DOMAIN_MAX_COST_USD_CENTS: 'domain.max_cost_usd_cents',
  BASIC_DOMAIN_MAX_COST_USD_CENTS: 'domain.basic_renewal_max_cost_usd_cents',
  PRO_DOMAIN_MAX_COST_USD_CENTS: 'domain.pro_renewal_max_cost_usd_cents',
} as const satisfies Record<string, IntKey>;

type CapEnvVar = keyof typeof CAP_SETTING;

/**
 * Reads the domain price caps from `get` (database over env). Throws on a
 * missing or invalid value so the API fails at boot instead of pricing
 * domains against a guessed cap.
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

function readCapSources(
  settings: SettingsService,
): Record<CapEnvVar, string | undefined> {
  return {
    DOMAIN_MAX_COST_USD_CENTS: settings.intRaw(
      CAP_SETTING.DOMAIN_MAX_COST_USD_CENTS,
    ),
    BASIC_DOMAIN_MAX_COST_USD_CENTS: settings.intRaw(
      CAP_SETTING.BASIC_DOMAIN_MAX_COST_USD_CENTS,
    ),
    PRO_DOMAIN_MAX_COST_USD_CENTS: settings.intRaw(
      CAP_SETTING.PRO_DOMAIN_MAX_COST_USD_CENTS,
    ),
  };
}

function capSignature(sources: Record<CapEnvVar, string | undefined>): string {
  return JSON.stringify([
    sources.DOMAIN_MAX_COST_USD_CENTS ?? null,
    sources.BASIC_DOMAIN_MAX_COST_USD_CENTS ?? null,
    sources.PRO_DOMAIN_MAX_COST_USD_CENTS ?? null,
  ]);
}

/**
 * Validates once at boot, then re-reads settings on every access.
 * An invalid later snapshot keeps the last valid caps and warns once per change.
 */
export async function loadDomainPriceCaps(
  settings: SettingsService,
): Promise<DomainPriceCaps> {
  await settings.ready();
  const initial = readCapSources(settings);
  let current = parseDomainPriceCaps((key) => initial[key as CapEnvVar]);
  let validSignature = capSignature(initial);
  let warnedSignature: string | null = null;

  const resolve = (): DomainPriceCaps => {
    const sources = readCapSources(settings);
    const signature = capSignature(sources);
    if (signature === validSignature) return current;
    try {
      current = parseDomainPriceCaps((key) => sources[key as CapEnvVar]);
      validSignature = signature;
      warnedSignature = null;
      return current;
    } catch (error) {
      if (signature !== warnedSignature) {
        warnedSignature = signature;
        const detail = error instanceof Error ? error.message : String(error);
        capsLogger.warn(
          `Ignoring invalid domain price caps (${detail}); keeping the last valid caps.`,
        );
      }
      return current;
    }
  };

  return {
    get purchaseUsdCents() {
      return resolve().purchaseUsdCents;
    },
    get basicRenewalUsdCents() {
      return resolve().basicRenewalUsdCents;
    },
    get proRenewalUsdCents() {
      return resolve().proRenewalUsdCents;
    },
  };
}
