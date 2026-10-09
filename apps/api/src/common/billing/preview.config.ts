import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import {
  envBool,
  envInt,
  envStringList,
  envWarningDay,
  SETTINGS,
  type ResolveContext,
} from '../settings/settings.registry';

export interface PreviewSettings {
  enabled: boolean;
  trialDays: number;
  warningDay: number;
  maxAssetBytes: number;
  allowedAssetMime: readonly string[];
  sanitizeEnabled: boolean;
  requireVerifiedEmail: boolean;
  publishRateLimitPerMin: number;
  assetRateLimitPerMin: number;
  notifyEnabled: boolean;
  notifyIntervalMinutes: number;
  notifyBatch: number;
}

const NO_CONTEXT: ResolveContext = { trialDays: 0 };

/**
 * Free-preview thresholds. Each read goes through {@link SettingsService}
 * (database, then the PREVIEW_* env vars, then the code default). An invalid
 * env value still fails startup; a bad database value does not.
 */
@Injectable()
export class PreviewConfig {
  constructor(
    config: ConfigService,
    private readonly settings: SettingsService,
  ) {
    loadPreviewSettings((key) => config.get<string>(key));
  }

  get enabled(): boolean {
    return this.settings.getBool('preview.enabled');
  }

  get trialDays(): number {
    return this.settings.getInt('preview.trial_days');
  }

  get warningDay(): number {
    return this.settings.getInt('preview.warning_day');
  }

  get maxAssetBytes(): number {
    return this.settings.getInt('preview.max_asset_bytes');
  }

  /** Empty list turns the unpaid mime/magic check off. */
  get allowedAssetMime(): readonly string[] {
    return this.settings.getStringList('preview.allowed_asset_mime');
  }

  get sanitizeEnabled(): boolean {
    return this.settings.getBool('preview.sanitize_enabled');
  }

  get requireVerifiedEmail(): boolean {
    return this.settings.getBool('preview.require_verified_email');
  }

  get publishRateLimitPerMin(): number {
    return this.settings.getInt('preview.publish_rate_limit_per_min');
  }

  get assetRateLimitPerMin(): number {
    return this.settings.getInt('preview.asset_rate_limit_per_min');
  }

  /** false skips the preview-ending email job. */
  get notifyEnabled(): boolean {
    return this.settings.getBool('preview.notify_enabled');
  }

  get notifyIntervalMinutes(): number {
    return this.settings.getInt('preview.notify_interval_minutes');
  }

  get notifyBatch(): number {
    return this.settings.getInt('preview.notify_batch');
  }
}

export function loadPreviewSettings(
  read: (key: string) => string | undefined,
): PreviewSettings {
  const trialDays = envInt(
    SETTINGS['preview.trial_days'],
    read('PREVIEW_TRIAL_DAYS'),
    NO_CONTEXT,
  );
  return {
    enabled: envBool(SETTINGS['preview.enabled'], read('PREVIEW_ENABLED')),
    trialDays,
    warningDay: envWarningDay(read('PREVIEW_WARNING_DAY'), trialDays),
    maxAssetBytes: envInt(
      SETTINGS['preview.max_asset_bytes'],
      read('PREVIEW_MAX_ASSET_BYTES'),
      NO_CONTEXT,
    ),
    allowedAssetMime: envStringList(
      SETTINGS['preview.allowed_asset_mime'],
      read('PREVIEW_ALLOWED_ASSET_MIME'),
    ),
    sanitizeEnabled: envBool(
      SETTINGS['preview.sanitize_enabled'],
      read('PREVIEW_SANITIZE_ENABLED'),
    ),
    requireVerifiedEmail: envBool(
      SETTINGS['preview.require_verified_email'],
      read('PREVIEW_REQUIRE_VERIFIED_EMAIL'),
    ),
    publishRateLimitPerMin: envInt(
      SETTINGS['preview.publish_rate_limit_per_min'],
      read('PREVIEW_PUBLISH_RATE_LIMIT_PER_MIN'),
      NO_CONTEXT,
    ),
    assetRateLimitPerMin: envInt(
      SETTINGS['preview.asset_rate_limit_per_min'],
      read('PREVIEW_ASSET_RATE_LIMIT_PER_MIN'),
      NO_CONTEXT,
    ),
    notifyEnabled: envBool(
      SETTINGS['preview.notify_enabled'],
      read('PREVIEW_NOTIFY_ENABLED'),
    ),
    notifyIntervalMinutes: envInt(
      SETTINGS['preview.notify_interval_minutes'],
      read('PREVIEW_NOTIFY_INTERVAL_MINUTES'),
      NO_CONTEXT,
    ),
    notifyBatch: envInt(
      SETTINGS['preview.notify_batch'],
      read('PREVIEW_NOTIFY_BATCH'),
      NO_CONTEXT,
    ),
  };
}
