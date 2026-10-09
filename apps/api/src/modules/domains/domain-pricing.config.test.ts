import 'reflect-metadata';
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../common/settings/settings.service';
import { loadDomainPriceCaps } from './domain-pricing.config';

const warnings: string[] = [];

const VALID_ENV = {
  DOMAIN_MAX_COST_USD_CENTS: '2200',
  BASIC_DOMAIN_MAX_COST_USD_CENTS: '2367',
  PRO_DOMAIN_MAX_COST_USD_CENTS: '4200',
};

const VALID_ROWS = new Map<string, unknown>([
  ['domain.max_cost_usd_cents', 2200],
  ['domain.basic_renewal_max_cost_usd_cents', 2367],
  ['domain.pro_renewal_max_cost_usd_cents', 4200],
]);

function configFrom(
  env: Record<string, string | undefined> = {},
): ConfigService {
  return { get: (key: string) => env[key] } as unknown as ConfigService;
}

function settingsFor(
  rows: Map<string, unknown>,
  env: Record<string, string | undefined> = {},
): SettingsService {
  return new SettingsService(configFrom(env), {
    loadAll: async () => new Map(rows),
  });
}

function capWarnings(): string[] {
  return warnings.filter((message) => message.includes('last valid caps'));
}

describe('loadDomainPriceCaps', () => {
  const originalWarn = Logger.prototype.warn;

  afterEach(() => {
    Logger.prototype.warn = originalWarn;
    warnings.length = 0;
  });

  function captureWarnings(): void {
    Logger.prototype.warn = (message: unknown) => {
      warnings.push(String(message));
    };
  }

  it('prefers the database over the environment', async () => {
    const rows = new Map(VALID_ROWS);
    rows.set('domain.max_cost_usd_cents', 1111);
    const caps = await loadDomainPriceCaps(settingsFor(rows, { ...VALID_ENV }));
    assert.equal(caps.purchaseUsdCents, 1111);
    assert.equal(caps.basicRenewalUsdCents, 2367);
    assert.equal(caps.proRenewalUsdCents, 4200);
  });

  it('uses the environment when the database row is absent', async () => {
    const caps = await loadDomainPriceCaps(
      settingsFor(new Map(), { ...VALID_ENV }),
    );
    assert.equal(caps.purchaseUsdCents, 2200);
    assert.equal(caps.basicRenewalUsdCents, 2367);
    assert.equal(caps.proRenewalUsdCents, 4200);
  });

  it('fails at boot when a cap is missing from both the database and the environment', async () => {
    for (const envVar of Object.keys(VALID_ENV)) {
      const env = { ...VALID_ENV };
      delete env[envVar as keyof typeof VALID_ENV];
      await assert.rejects(
        () => loadDomainPriceCaps(settingsFor(new Map(), env)),
        new RegExp(`${envVar} must be set to a positive integer`),
      );
    }
  });

  it('fails at boot when a cap is not a positive integer', async () => {
    await assert.rejects(
      () =>
        loadDomainPriceCaps(
          settingsFor(new Map(), {
            ...VALID_ENV,
            BASIC_DOMAIN_MAX_COST_USD_CENTS: '0',
          }),
        ),
      /BASIC_DOMAIN_MAX_COST_USD_CENTS must be set to a positive integer/,
    );
  });

  it('fails at boot when BASIC > PRO', async () => {
    const rows = new Map(VALID_ROWS);
    rows.set('domain.basic_renewal_max_cost_usd_cents', 4201);
    await assert.rejects(
      () => loadDomainPriceCaps(settingsFor(rows)),
      /BASIC_DOMAIN_MAX_COST_USD_CENTS must be <= PRO_DOMAIN_MAX_COST_USD_CENTS/,
    );
  });

  it('applies a changed row without restarting', async () => {
    const rows = new Map(VALID_ROWS);
    const settings = settingsFor(rows);
    const caps = await loadDomainPriceCaps(settings);
    assert.equal(caps.purchaseUsdCents, 2200);

    rows.set('domain.max_cost_usd_cents', 1500);
    await settings.reload();
    assert.equal(caps.purchaseUsdCents, 1500);
    assert.equal(caps.basicRenewalUsdCents, 2367);
  });

  it('keeps the last valid caps and warns once per invalid change', async () => {
    captureWarnings();
    const rows = new Map(VALID_ROWS);
    const settings = settingsFor(rows);
    const caps = await loadDomainPriceCaps(settings);

    rows.set('domain.basic_renewal_max_cost_usd_cents', 9000);
    await settings.reload();
    assert.equal(caps.basicRenewalUsdCents, 2367);
    assert.equal(caps.proRenewalUsdCents, 4200);
    assert.equal(caps.purchaseUsdCents, 2200);
    assert.equal(capWarnings().length, 1);

    assert.equal(caps.basicRenewalUsdCents, 2367);
    assert.equal(capWarnings().length, 1);

    rows.set('domain.basic_renewal_max_cost_usd_cents', 8000);
    await settings.reload();
    assert.equal(caps.basicRenewalUsdCents, 2367);
    assert.equal(capWarnings().length, 2);

    rows.set('domain.basic_renewal_max_cost_usd_cents', 3000);
    await settings.reload();
    assert.equal(caps.basicRenewalUsdCents, 3000);
    assert.equal(capWarnings().length, 2);

    rows.set('domain.basic_renewal_max_cost_usd_cents', 9000);
    await settings.reload();
    assert.equal(caps.basicRenewalUsdCents, 3000);
    assert.equal(capWarnings().length, 3);
  });
});
