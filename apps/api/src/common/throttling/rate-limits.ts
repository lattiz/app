import { Throttle } from '@nestjs/throttler';

const MINUTE_MS = 60_000;

// Default for every route, per client IP: generous enough for dashboard polling (job every 2s, DNS every 10s).
export const DEFAULT_RATE_LIMIT = { ttl: MINUTE_MS, limit: 120 };

/** Routes that hit a rate-limited provider (Openprovider, Stripe) on every request. */
export const ProviderLookupRateLimit = (): MethodDecorator & ClassDecorator =>
  Throttle({ default: { ttl: MINUTE_MS, limit: 30 } });

/** Routes that start a purchase, a checkout or another expensive side effect. */
export const SensitiveActionRateLimit = (): MethodDecorator & ClassDecorator =>
  Throttle({ default: { ttl: MINUTE_MS, limit: 5 } });
