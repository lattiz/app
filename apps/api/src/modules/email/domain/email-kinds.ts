/** Email kinds the outbox and templates understand. */
export const EMAIL_KINDS = [
  'welcome',
  'payment_failed',
  'site_suspended',
  'site_reactivated',
  'domain_ready',
  'domain_purchase_failed',
  'account_deleted',
  'renewal_upcoming',
  'renewal_last_notice',
  'domain_renewed',
  'domain_expired',
  'preview_ending',
] as const;

export type EmailKind = (typeof EMAIL_KINDS)[number];

/** Definitive purchase failures: user must pick another domain (mirrors web JOB_FAILURES next:'search'). */
export const DOMAIN_PURCHASE_EMAIL_FAILURE_CODES = [
  'REGISTRATION_REJECTED',
  'DOMAIN_NO_LONGER_AVAILABLE',
  'DNS_ZONE_REJECTED',
] as const;

export type DomainPurchaseEmailFailureCode =
  (typeof DOMAIN_PURCHASE_EMAIL_FAILURE_CODES)[number];

export function isDefinitiveDomainPurchaseFailure(
  code: string,
): code is DomainPurchaseEmailFailureCode {
  return (DOMAIN_PURCHASE_EMAIL_FAILURE_CODES as readonly string[]).includes(
    code,
  );
}

/** Exponential backoff after each failed send attempt (max 6 attempts). */
export const EMAIL_BACKOFF_MS = [
  60_000, // 1m
  5 * 60_000, // 5m
  30 * 60_000, // 30m
  2 * 60 * 60_000, // 2h
  6 * 60 * 60_000, // 6h
] as const;

export const EMAIL_MAX_ATTEMPTS = 6;
export const EMAIL_STUCK_SENDING_MS = 15 * 60_000;
export const EMAIL_FETCH_TIMEOUT_MS = 15_000;

export const DASHBOARD_BASE = 'https://dashboard.lattiz.app';
export const DASHBOARD_URLS = {
  home: `${DASHBOARD_BASE}/dashboard`,
  subscription: `${DASHBOARD_BASE}/dashboard/subscription`,
  domain: `${DASHBOARD_BASE}/dashboard/domain`,
} as const;
