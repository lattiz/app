import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../common/settings/settings.service';
import { createRegistrarAdapter } from './domains.module';
import type { OpenproviderClient } from './infrastructure/openprovider/openprovider.client';

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

describe('createRegistrarAdapter', () => {
  const client = {} as OpenproviderClient;

  it('uses the mock adapter when the setting is true and the real one when it is false', async () => {
    const mocked = await createRegistrarAdapter(
      client,
      configFrom({ OPENPROVIDER_MOCK_PURCHASES: 'false' }),
      settingsFor(new Map([['domains.mock_purchases', true]]), {
        OPENPROVIDER_MOCK_PURCHASES: 'false',
      }),
    );
    assert.equal(mocked.isMockMode, true);

    const real = await createRegistrarAdapter(
      client,
      configFrom({ OPENPROVIDER_MOCK_PURCHASES: 'true' }),
      settingsFor(new Map([['domains.mock_purchases', false]]), {
        OPENPROVIDER_MOCK_PURCHASES: 'true',
      }),
    );
    assert.equal(real.isMockMode, false);
  });

  it('falls back to the env var, then the code default, when the row is absent', async () => {
    const fromEnv = await createRegistrarAdapter(
      client,
      configFrom({ OPENPROVIDER_MOCK_PURCHASES: 'true' }),
      settingsFor(new Map(), { OPENPROVIDER_MOCK_PURCHASES: 'true' }),
    );
    assert.equal(fromEnv.isMockMode, true);

    const fromDefault = await createRegistrarAdapter(
      client,
      configFrom({}),
      settingsFor(new Map()),
    );
    assert.equal(fromDefault.isMockMode, false);
  });
});
