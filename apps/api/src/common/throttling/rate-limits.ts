import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export const MINUTE_MS = 60_000;

export const PREVIEW_RATE_LIMIT_KIND = 'previewRateLimitKind';
export type PreviewRateLimitKind = 'publish' | 'asset';

/** Unpaid publish calls. The limit itself is read from PreviewConfig at request time. */
export const PreviewPublishRateLimit = (): MethodDecorator =>
  SetMetadata(
    PREVIEW_RATE_LIMIT_KIND,
    'publish' satisfies PreviewRateLimitKind,
  );

/** Unpaid asset uploads. The limit itself is read from PreviewConfig at request time. */
export const PreviewAssetRateLimit = (): MethodDecorator =>
  SetMetadata(PREVIEW_RATE_LIMIT_KIND, 'asset' satisfies PreviewRateLimitKind);

// Default for every route, per client IP: generous enough for dashboard polling (job every 2s, DNS every 10s).
export const DEFAULT_RATE_LIMIT = { ttl: MINUTE_MS, limit: 120 };

/** Routes that hit a rate-limited provider (Openprovider, Stripe) on every request. */
export const ProviderLookupRateLimit = (): MethodDecorator & ClassDecorator =>
  Throttle({ default: { ttl: MINUTE_MS, limit: 30 } });

/** Routes that start a purchase, a checkout or another expensive side effect. */
export const SensitiveActionRateLimit = (): MethodDecorator & ClassDecorator =>
  Throttle({ default: { ttl: MINUTE_MS, limit: 5 } });

/** Unauthenticated reads (landing page); CDNs absorb most traffic via Cache-Control. */
export const PublicReadRateLimit = (): MethodDecorator & ClassDecorator =>
  Throttle({ default: { ttl: MINUTE_MS, limit: 60 } });
