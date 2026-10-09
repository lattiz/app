import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { SettingsStorePort } from './settings-store.port';
import { refreshIntervalSeconds, SettingsService } from './settings.service';

function configFrom(
  env: Record<string, string | undefined> = {},
): ConfigService {
  return { get: (key: string) => env[key] } as unknown as ConfigService;
}

function serviceWith(
  env: Record<string, string | undefined>,
  store: SettingsStorePort,
): SettingsService {
  return new SettingsService(configFrom(env), store);
}

describe('refreshIntervalSeconds', () => {
  it('defaults to 60 and rejects values below 5', () => {
    assert.equal(refreshIntervalSeconds(undefined), 60);
    assert.equal(refreshIntervalSeconds(''), 60);
    assert.equal(refreshIntervalSeconds('5'), 5);
    assert.equal(refreshIntervalSeconds('120'), 120);
    assert.throws(
      () => refreshIntervalSeconds('4'),
      /SETTINGS_REFRESH_SECONDS/,
    );
    assert.throws(
      () => refreshIntervalSeconds('nope'),
      /SETTINGS_REFRESH_SECONDS/,
    );
  });
});

describe('SettingsService', () => {
  const warnings: string[] = [];
  const errors: string[] = [];
  const originalWarn = Logger.prototype.warn;
  const originalError = Logger.prototype.error;

  afterEach(() => {
    Logger.prototype.warn = originalWarn;
    Logger.prototype.error = originalError;
    warnings.length = 0;
    errors.length = 0;
    mock.timers.reset();
  });

  function captureLogs(): void {
    Logger.prototype.warn = (message: unknown) => {
      warnings.push(String(message));
    };
    Logger.prototype.error = (message: unknown) => {
      errors.push(String(message));
    };
  }

  it('resolves database over env over the code default', async () => {
    const rows = new Map<string, unknown>([
      ['preview.trial_days', 5],
      ['preview.enabled', false],
      ['preview.allowed_asset_mime', ['image/png']],
    ]);
    const settings = serviceWith(
      {
        PREVIEW_TRIAL_DAYS: '9',
        PREVIEW_ENABLED: 'true',
        PREVIEW_ALLOWED_ASSET_MIME: 'image/gif',
        PREVIEW_NOTIFY_BATCH: '4',
      },
      { loadAll: async () => new Map(rows) },
    );
    await settings.reload();

    assert.equal(settings.getInt('preview.trial_days'), 5);
    assert.equal(settings.getBool('preview.enabled'), false);
    assert.deepEqual(settings.getStringList('preview.allowed_asset_mime'), [
      'image/png',
    ]);
    assert.equal(settings.getInt('preview.notify_batch'), 4);
    assert.equal(settings.getInt('email.max_per_run'), 20);
    assert.equal(settings.getBool('domains.mock_purchases'), false);

    rows.delete('preview.trial_days');
    await settings.reload();
    assert.equal(settings.getInt('preview.trial_days'), 9);

    assert.throws(
      () =>
        serviceWith({}, { loadAll: async () => new Map() }).getInt(
          'domain.max_cost_usd_cents',
        ),
      /DOMAIN_MAX_COST_USD_CENTS must be set to an integer/,
    );
  });

  it('ignores a mistyped database value, warns once, and falls back', async () => {
    captureLogs();
    const rows = new Map<string, unknown>([
      ['preview.trial_days', '9'],
      ['preview.enabled', 1],
      ['email.max_per_run', 3],
    ]);
    const settings = serviceWith(
      { PREVIEW_TRIAL_DAYS: '12', PREVIEW_ENABLED: 'false' },
      { loadAll: async () => new Map(rows) },
    );
    await settings.reload();

    assert.equal(settings.getInt('preview.trial_days'), 12);
    assert.equal(settings.getInt('preview.trial_days'), 12);
    assert.equal(settings.getBool('preview.enabled'), false);
    assert.equal(settings.getBool('preview.enabled'), false);
    assert.equal(settings.getInt('email.max_per_run'), 3);

    const trialWarnings = warnings.filter((message) =>
      message.includes('preview.trial_days'),
    );
    const enabledWarnings = warnings.filter((message) =>
      message.includes('preview.enabled'),
    );
    assert.equal(trialWarnings.length, 1);
    assert.equal(enabledWarnings.length, 1);
    assert.equal(
      warnings.filter((message) => message.includes('email.max_per_run'))
        .length,
      0,
    );
  });

  it('falls back to the code default when the database value and the env are unusable', async () => {
    captureLogs();
    const settings = serviceWith(
      {},
      {
        loadAll: async () =>
          new Map<string, unknown>([
            ['preview.notify_batch', { n: 1 }],
            ['preview.trial_days', 999],
          ]),
      },
    );
    await settings.reload();
    assert.equal(settings.getInt('preview.notify_batch'), 50);
    assert.equal(settings.getInt('preview.notify_batch'), 50);
    assert.equal(settings.getInt('preview.trial_days'), 14);
    assert.equal(warnings.length, 2);
  });

  it('keeps serving env defaults when the first load fails', async () => {
    captureLogs();
    const settings = serviceWith(
      { PREVIEW_TRIAL_DAYS: '8' },
      {
        loadAll: async () => {
          throw new Error('connection refused');
        },
      },
    );
    await settings.onModuleInit();
    try {
      assert.equal(settings.getInt('preview.trial_days'), 8);
      assert.equal(settings.getBool('preview.enabled'), true);
      assert.equal(errors.length, 1);
      assert.match(errors[0], /connection refused/);
    } finally {
      settings.onModuleDestroy();
    }
  });

  it('keeps the previous snapshot when a later reload fails', async () => {
    captureLogs();
    let fail = false;
    const settings = serviceWith(
      {},
      {
        loadAll: async () => {
          if (fail) throw new Error('timeout');
          return new Map<string, unknown>([['preview.trial_days', 4]]);
        },
      },
    );
    await settings.reload();
    assert.equal(settings.getInt('preview.trial_days'), 4);
    fail = true;
    await settings.reload();
    assert.equal(settings.getInt('preview.trial_days'), 4);
    assert.equal(errors.length, 1);
  });

  it('picks up a changed row on reload and on the refresh interval', async () => {
    const rows = new Map<string, unknown>([['preview.trial_days', 3]]);
    const settings = serviceWith(
      { SETTINGS_REFRESH_SECONDS: '5' },
      { loadAll: async () => new Map(rows) },
    );
    await settings.reload();
    assert.equal(settings.getInt('preview.trial_days'), 3);

    rows.set('preview.trial_days', 11);
    await settings.reload();
    assert.equal(settings.getInt('preview.trial_days'), 11);

    mock.timers.enable({ apis: ['setInterval'] });
    await settings.onModuleInit();
    try {
      rows.set('preview.trial_days', 15);
      assert.equal(settings.getInt('preview.trial_days'), 11);
      mock.timers.tick(5_000);
      await settings.reload();
      assert.equal(settings.getInt('preview.trial_days'), 15);
    } finally {
      settings.onModuleDestroy();
    }
  });

  it('clears the refresh timer on destroy', async () => {
    let loads = 0;
    const settings = serviceWith(
      { SETTINGS_REFRESH_SECONDS: '5' },
      {
        loadAll: async () => {
          loads += 1;
          return new Map<string, unknown>([['preview.trial_days', 3]]);
        },
      },
    );
    mock.timers.enable({ apis: ['setInterval'] });
    try {
      await settings.onModuleInit();
      const afterInit = loads;
      assert.ok(afterInit >= 1);
      settings.onModuleDestroy();
      mock.timers.tick(60_000);
      await Promise.resolve();
      assert.equal(loads, afterInit);
      assert.equal(settings.getInt('preview.trial_days'), 3);
    } finally {
      settings.onModuleDestroy();
    }
  });

  it('shares one in-flight load across concurrent reload calls', async () => {
    let calls = 0;
    let release: (rows: ReadonlyMap<string, unknown>) => void = () => undefined;
    const settings = serviceWith(
      {},
      {
        loadAll: () => {
          calls += 1;
          return new Promise((resolve) => {
            release = resolve;
          });
        },
      },
    );
    const first = settings.reload();
    const second = settings.reload();
    assert.equal(calls, 1);
    release(new Map([['preview.enabled', false]]));
    await Promise.all([first, second]);
    assert.equal(settings.getBool('preview.enabled'), false);
    assert.equal(calls, 1);
  });

  it('derives warningDay and accepts only a strict override', async () => {
    captureLogs();
    const rows = new Map<string, unknown>();
    const settings = serviceWith({}, { loadAll: async () => new Map(rows) });

    assert.equal(settings.getInt('preview.warning_day'), 10);

    rows.set('preview.trial_days', 7);
    await settings.reload();
    assert.equal(settings.getInt('preview.warning_day'), 6);

    rows.set('preview.trial_days', 1);
    await settings.reload();
    assert.equal(settings.getInt('preview.warning_day'), 0);

    rows.set('preview.trial_days', 30);
    rows.set('preview.warning_day', 12);
    await settings.reload();
    assert.equal(settings.getInt('preview.warning_day'), 12);

    rows.set('preview.warning_day', 30);
    await settings.reload();
    assert.equal(settings.getInt('preview.warning_day'), 10);
    assert.equal(settings.getInt('preview.warning_day'), 10);

    rows.set('preview.warning_day', 4);
    await settings.reload();
    assert.equal(settings.getInt('preview.warning_day'), 4);

    rows.set('preview.warning_day', false);
    await settings.reload();
    assert.equal(settings.getInt('preview.warning_day'), 10);
    assert.equal(
      warnings.filter((message) => message.includes('preview.warning_day'))
        .length,
      2,
    );
  });

  it('uses a valid env warning day when the database override is invalid', async () => {
    captureLogs();
    const settings = serviceWith(
      { PREVIEW_TRIAL_DAYS: '14', PREVIEW_WARNING_DAY: '9' },
      {
        loadAll: async () =>
          new Map<string, unknown>([['preview.warning_day', 0]]),
      },
    );
    await settings.reload();
    assert.equal(settings.getInt('preview.warning_day'), 9);
    assert.equal(warnings.length, 1);
  });

  it('does not start when the refresh interval is invalid', async () => {
    const settings = serviceWith(
      { SETTINGS_REFRESH_SECONDS: '1' },
      {
        loadAll: async () => {
          throw new Error('should not load');
        },
      },
    );
    await assert.rejects(
      () => settings.onModuleInit(),
      /SETTINGS_REFRESH_SECONDS/,
    );
  });

  it('ready() loads the snapshot once and resolves for later callers', async () => {
    let calls = 0;
    const settings = serviceWith(
      {},
      {
        loadAll: async () => {
          calls += 1;
          return new Map<string, unknown>([['domains.mock_purchases', true]]);
        },
      },
    );
    await Promise.all([settings.ready(), settings.ready()]);
    await settings.ready();
    assert.equal(calls, 1);
    assert.equal(settings.getBool('domains.mock_purchases'), true);
  });

  it('parses zone lists from the database and from a comma-separated env', async () => {
    const fromDb = serviceWith(
      { DNS_RECONCILE_KEEP_ZONES: 'other.test' },
      {
        loadAll: async () =>
          new Map<string, unknown>([
            ['dns.reconcile.keep_zones', ['Lattiz.app', '', 'example.com']],
          ]),
      },
    );
    await fromDb.reload();
    assert.deepEqual(fromDb.getStringList('dns.reconcile.keep_zones'), [
      'lattiz.app',
      'example.com',
    ]);

    const fromEnv = serviceWith(
      { DNS_RECONCILE_KEEP_ZONES: 'Lattiz.app, example.com' },
      { loadAll: async () => new Map() },
    );
    assert.deepEqual(fromEnv.getStringList('dns.reconcile.keep_zones'), [
      'lattiz.app',
      'example.com',
    ]);
  });
});
