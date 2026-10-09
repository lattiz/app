import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { loadPreviewSettings, PreviewConfig } from './preview.config';

function configFrom(env: Record<string, string | undefined>): ConfigService {
  return { get: (key: string) => env[key] } as unknown as ConfigService;
}

function previewFrom(
  env: Record<string, string | undefined> = {},
): PreviewConfig {
  const config = configFrom(env);
  return new PreviewConfig(
    config,
    new SettingsService(config, {
      loadAll: () => Promise.resolve(new Map()),
    }),
  );
}

function read(env: Record<string, string | undefined>) {
  return (key: string) => env[key];
}

describe('loadPreviewSettings', () => {
  it('uses the documented defaults when the variables are unset', () => {
    assert.deepEqual(loadPreviewSettings(read({})), {
      enabled: true,
      trialDays: 14,
      warningDay: 10,
      maxAssetBytes: 26_214_400,
      allowedAssetMime: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      sanitizeEnabled: true,
      requireVerifiedEmail: true,
      publishRateLimitPerMin: 6,
      assetRateLimitPerMin: 20,
      notifyEnabled: true,
      notifyIntervalMinutes: 60,
      notifyBatch: 50,
    });
  });

  it('accepts an explicit valid set', () => {
    const settings = loadPreviewSettings(
      read({
        PREVIEW_ENABLED: 'false',
        PREVIEW_TRIAL_DAYS: '30',
        PREVIEW_WARNING_DAY: '29',
        PREVIEW_MAX_ASSET_BYTES: '1024',
        PREVIEW_ALLOWED_ASSET_MIME: 'image/png, image/png, image/webp',
        PREVIEW_SANITIZE_ENABLED: 'false',
        PREVIEW_REQUIRE_VERIFIED_EMAIL: 'false',
        PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN: '0',
        PREVIEW_ASSET_RATE_LIMIT_PER_MIN: '3',
        PREVIEW_NOTIFY_ENABLED: 'false',
        PREVIEW_NOTIFY_INTERVAL_MINUTES: '15',
        PREVIEW_NOTIFY_BATCH: '3',
      }),
    );
    assert.deepEqual(settings, {
      enabled: false,
      trialDays: 30,
      warningDay: 29,
      maxAssetBytes: 1024,
      allowedAssetMime: ['image/png', 'image/webp'],
      sanitizeEnabled: false,
      requireVerifiedEmail: false,
      publishRateLimitPerMin: 0,
      assetRateLimitPerMin: 3,
      notifyEnabled: false,
      notifyIntervalMinutes: 15,
      notifyBatch: 3,
    });
  });

  it('rejects a non-boolean switch', () => {
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_ENABLED: 'yes' })),
      /PREVIEW_ENABLED="yes"/,
    );
  });

  it('rejects trial days outside 1..365', () => {
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_TRIAL_DAYS: '0' })),
      /PREVIEW_TRIAL_DAYS/,
    );
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_TRIAL_DAYS: '366' })),
      /PREVIEW_TRIAL_DAYS/,
    );
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_TRIAL_DAYS: '14.5' })),
      /PREVIEW_TRIAL_DAYS/,
    );
  });

  it('derives the warning day when it is unset', () => {
    assert.equal(
      loadPreviewSettings(read({ PREVIEW_TRIAL_DAYS: '7' })).warningDay,
      6,
    );
    assert.equal(
      loadPreviewSettings(read({ PREVIEW_TRIAL_DAYS: '10' })).warningDay,
      9,
    );
    assert.equal(
      loadPreviewSettings(read({ PREVIEW_TRIAL_DAYS: '1' })).warningDay,
      0,
    );
  });

  it('rejects a warning day that is not strictly before the trial length', () => {
    assert.throws(
      () =>
        loadPreviewSettings(
          read({ PREVIEW_TRIAL_DAYS: '10', PREVIEW_WARNING_DAY: '10' }),
        ),
      /PREVIEW_WARNING_DAY/,
    );
    assert.throws(
      () =>
        loadPreviewSettings(
          read({ PREVIEW_TRIAL_DAYS: '14', PREVIEW_WARNING_DAY: '0' }),
        ),
      /PREVIEW_WARNING_DAY/,
    );
    assert.throws(
      () =>
        loadPreviewSettings(
          read({ PREVIEW_TRIAL_DAYS: '1', PREVIEW_WARNING_DAY: '1' }),
        ),
      /PREVIEW_WARNING_DAY/,
    );
  });

  it('rejects a non-boolean sanitize switch', () => {
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_SANITIZE_ENABLED: 'yes' })),
      /PREVIEW_SANITIZE_ENABLED="yes"/,
    );
  });

  it('rejects a non-boolean verified-email switch', () => {
    assert.throws(
      () =>
        loadPreviewSettings(read({ PREVIEW_REQUIRE_VERIFIED_EMAIL: 'yes' })),
      /PREVIEW_REQUIRE_VERIFIED_EMAIL="yes"/,
    );
  });

  it('rejects an invalid preview notify setting', () => {
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_NOTIFY_ENABLED: 'yes' })),
      /PREVIEW_NOTIFY_ENABLED="yes"/,
    );
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_NOTIFY_INTERVAL_MINUTES: '0' })),
      /PREVIEW_NOTIFY_INTERVAL_MINUTES/,
    );
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_NOTIFY_BATCH: '0' })),
      /PREVIEW_NOTIFY_BATCH/,
    );
  });

  it('rejects a negative preview rate limit', () => {
    assert.throws(
      () =>
        loadPreviewSettings(read({ PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN: '-1' })),
      /PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN/,
    );
    assert.throws(
      () =>
        loadPreviewSettings(read({ PREVIEW_ASSET_RATE_LIMIT_PER_MIN: '1.5' })),
      /PREVIEW_ASSET_RATE_LIMIT_PER_MIN/,
    );
  });

  it('treats a zero asset cap as disabled and rejects a negative one', () => {
    assert.equal(
      loadPreviewSettings(read({ PREVIEW_MAX_ASSET_BYTES: '0' })).maxAssetBytes,
      0,
    );
    assert.throws(
      () => loadPreviewSettings(read({ PREVIEW_MAX_ASSET_BYTES: '-1' })),
      /PREVIEW_MAX_ASSET_BYTES/,
    );
  });

  it('parses the mime allowlist and treats a blank value as off', () => {
    assert.deepEqual(
      loadPreviewSettings(read({ PREVIEW_ALLOWED_ASSET_MIME: '' }))
        .allowedAssetMime,
      [],
    );
    assert.throws(
      () =>
        loadPreviewSettings(
          read({ PREVIEW_ALLOWED_ASSET_MIME: 'image/png,nope' }),
        ),
      /PREVIEW_ALLOWED_ASSET_MIME/,
    );
  });

  it('fails in the provider when the environment is invalid', () => {
    const config = configFrom({ PREVIEW_TRIAL_DAYS: '0' });
    assert.throws(
      () =>
        new PreviewConfig(
          config,
          new SettingsService(config, {
            loadAll: () => Promise.resolve(new Map()),
          }),
        ),
      /PREVIEW_TRIAL_DAYS/,
    );
  });

  it('reads env fallbacks through the same properties', () => {
    const env = { PREVIEW_TRIAL_DAYS: '7', PREVIEW_ENABLED: 'false' };
    const preview = previewFrom(env);
    const loaded = loadPreviewSettings((key) => env[key as keyof typeof env]);
    assert.equal(preview.enabled, loaded.enabled);
    assert.equal(preview.trialDays, loaded.trialDays);
    assert.equal(preview.warningDay, loaded.warningDay);
    assert.equal(preview.warningDay, 6);
  });

  it('reflects a database change without reconstructing PreviewConfig', async () => {
    const rows = new Map<string, unknown>();
    const config = configFrom({});
    const settings = new SettingsService(config, {
      loadAll: () => Promise.resolve(new Map(rows)),
    });
    const preview = new PreviewConfig(config, settings);
    assert.equal(preview.trialDays, 14);
    assert.equal(preview.warningDay, 10);

    rows.set('preview.trial_days', 6);
    await settings.reload();
    assert.equal(preview.trialDays, 6);
    assert.equal(preview.warningDay, 5);

    rows.set('preview.warning_day', 2);
    await settings.reload();
    assert.equal(preview.warningDay, 2);

    rows.set('preview.warning_day', 6);
    await settings.reload();
    assert.equal(preview.warningDay, 5);

    rows.set('preview.warning_day', 'soon');
    await settings.reload();
    assert.equal(preview.warningDay, 5);
  });
});
