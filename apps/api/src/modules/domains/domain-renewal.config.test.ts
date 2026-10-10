import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../common/settings/settings.service';
import {
  computeRenewalCharge,
  DomainRenewalConfig,
} from './domain-renewal.config';

function configFrom(
  env: Record<string, string | undefined> = {},
): ConfigService {
  return { get: (key: string) => env[key] } as unknown as ConfigService;
}

describe('computeRenewalCharge', () => {
  it('rounds IVA to the nearest cent', () => {
    assert.deepEqual(computeRenewalCharge(59900, 1600), {
      baseCents: 59900,
      taxCents: 9584,
      totalCents: 69484,
    });
    assert.deepEqual(computeRenewalCharge(1, 5000), {
      baseCents: 1,
      taxCents: 1,
      totalCents: 2,
    });
    assert.deepEqual(computeRenewalCharge(1, 4999), {
      baseCents: 1,
      taxCents: 0,
      totalCents: 1,
    });
  });
});

describe('DomainRenewalConfig', () => {
  it('uses the pro fee only for the pro plan', async () => {
    const settings = new SettingsService(configFrom({}), {
      loadAll: async () =>
        new Map<string, unknown>([
          ['domain.renewal.fee_basic_mxn_cents', 59900],
          ['domain.renewal.fee_pro_mxn_cents', 42000],
        ]),
    });
    await settings.reload();
    const config = new DomainRenewalConfig(settings);

    assert.equal(config.feeMxnCents('pro'), 42000);
    assert.equal(config.feeMxnCents('basico'), 59900);
    assert.equal(config.feeMxnCents('none'), 59900);
  });
});
