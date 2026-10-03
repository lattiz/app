import {
  DnsProviderApiException,
  RegistrarApiException,
} from './domains.exceptions';

/**
 * - config: our credentials/settings are wrong (401/403, missing config) — never the user's fault, retrying will not help
 * - rejected: the provider understood and refused the request (other 4xx)
 * - transient: no answer, 5xx, 429 or 408 — retrying later may work
 * - unknown: not a provider error at all
 */
export type ProviderFailureKind =
  | 'config'
  | 'rejected'
  | 'transient'
  | 'unknown';

// Observed live from Cloudflare for a bad or under-scoped token: 10000 "Authentication error" (403), 6003 "Invalid request headers" (400).
const CLOUDFLARE_AUTH_CODES = new Set([10000, 6003]);

// 429/408 are 4xx but say nothing about the request itself.
const TRANSIENT_CLIENT_STATUSES = new Set([408, 425, 429]);

export function classifyProviderFailure(err: unknown): ProviderFailureKind {
  if (
    !(err instanceof RegistrarApiException) &&
    !(err instanceof DnsProviderApiException)
  ) {
    return 'unknown';
  }
  if (err instanceof RegistrarApiException) {
    if (err.configError) return 'config';
    // A failed login means our reseller credentials are wrong, whatever the registrar's status code.
    if (
      err.operation === 'login' &&
      err.httpStatus !== undefined &&
      err.httpStatus < 500 &&
      !TRANSIENT_CLIENT_STATUSES.has(err.httpStatus)
    ) {
      return 'config';
    }
  }
  if (
    err instanceof DnsProviderApiException &&
    err.providerCode !== undefined &&
    CLOUDFLARE_AUTH_CODES.has(err.providerCode)
  ) {
    return 'config';
  }
  const status = err.httpStatus;
  if (status === 401 || status === 403) return 'config';
  if (
    status !== undefined &&
    status >= 400 &&
    status < 500 &&
    !TRANSIENT_CLIENT_STATUSES.has(status)
  ) {
    return 'rejected';
  }
  return 'transient';
}
