import { Injectable } from '@nestjs/common';
import {
  computePreviewCapability,
  type PreviewCapability,
  type PreviewCapabilityInput,
} from './preview-capability';
import { PreviewConfig } from './preview.config';

/** Applies {@link computePreviewCapability} with the injected config. */
@Injectable()
export class PreviewCapabilityService {
  constructor(private readonly preview: PreviewConfig) {}

  get enabled(): boolean {
    return this.preview.enabled;
  }

  evaluate(input: PreviewCapabilityInput, now?: Date): PreviewCapability {
    return computePreviewCapability(
      input,
      { enabled: this.preview.enabled, trialDays: this.preview.trialDays },
      now,
    );
  }

  /** First publish of a never-paid tenant stamps the window. A later publish must not. */
  shouldSeal(input: PreviewCapabilityInput, now?: Date): boolean {
    if (!this.preview.enabled) return false;
    return this.evaluate(input, now).state === 'trial_unstarted';
  }

  /** Paid publishes stay byte-for-byte; the switch drops the unpaid scrub. */
  shouldSanitizePublishedHtml(isEntitled: boolean): boolean {
    return this.preview.sanitizeEnabled && !isEntitled;
  }

  /** Unpaid uploads must match the configured mime list and its file header. An empty list turns this off. */
  shouldVerifyAssetBytes(isEntitled: boolean): boolean {
    return !isEntitled && this.preview.allowedAssetMime.length > 0;
  }

  allowedAssetMime(): readonly string[] {
    return this.preview.allowedAssetMime;
  }

  /** Null for a paying tenant, or when PREVIEW_MAX_ASSET_BYTES is 0. */
  unpaidAssetByteLimit(isEntitled: boolean): number | null {
    if (isEntitled || this.preview.maxAssetBytes <= 0) return null;
    return this.preview.maxAssetBytes;
  }
}
