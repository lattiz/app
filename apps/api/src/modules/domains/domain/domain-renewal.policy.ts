/** One calendar day. Renewal thresholds never use local midnight. */
export const RENEWAL_DAY_MS = 86_400_000;

export type RenewalPhase = 'not_due' | 'open' | 'late' | 'lapsed';

export interface RenewalWindow {
  phase: RenewalPhase;
  /** When the pay link opens. */
  opensAt: Date;
  /** Registrar expiry. */
  expiresAt: Date;
  /** Last moment a late payment is accepted. */
  lateDeadlineAt: Date;
}

export function renewalWindow(input: {
  expiresAt: Date;
  now: Date;
  openDaysBefore: number;
  lateDays: number;
}): RenewalWindow {
  const expiresAt = new Date(input.expiresAt.getTime());
  const opensAt = new Date(
    expiresAt.getTime() - input.openDaysBefore * RENEWAL_DAY_MS,
  );
  const lateDeadlineAt = new Date(
    expiresAt.getTime() + input.lateDays * RENEWAL_DAY_MS,
  );
  const now = input.now.getTime();
  let phase: RenewalPhase;
  if (now < opensAt.getTime()) phase = 'not_due';
  else if (now < expiresAt.getTime()) phase = 'open';
  else if (now < lateDeadlineAt.getTime()) phase = 'late';
  else phase = 'lapsed';
  return { phase, opensAt, expiresAt, lateDeadlineAt };
}

export type RenewalNotice =
  | { kind: 'before'; days: number }
  | { kind: 'after'; days: number };

/**
 * The single most recent notice whose threshold has been reached, or null.
 * Only one is returned so a missed cron day never sends a burst of stale notices.
 */
export function currentRenewalNotice(input: {
  expiresAt: Date;
  now: Date;
  noticeDaysBefore: readonly number[];
  lateNoticeDaysAfter: readonly number[];
  openDaysBefore: number;
  lateDays: number;
}): RenewalNotice | null {
  const window = renewalWindow(input);
  if (window.phase === 'not_due' || window.phase === 'lapsed') return null;

  const now = input.now.getTime();
  const expiresAt = input.expiresAt.getTime();
  let best: RenewalNotice | null = null;
  let bestAt = Number.NEGATIVE_INFINITY;

  for (const days of input.noticeDaysBefore) {
    if (days > input.openDaysBefore) continue;
    const at = expiresAt - days * RENEWAL_DAY_MS;
    if (now < at || at < bestAt) continue;
    best = { kind: 'before', days };
    bestAt = at;
  }
  for (const days of input.lateNoticeDaysAfter) {
    if (days >= input.lateDays) continue;
    const at = expiresAt + days * RENEWAL_DAY_MS;
    if (now < at || at < bestAt) continue;
    best = { kind: 'after', days };
    bestAt = at;
  }

  return best;
}

/** Stable idempotency key, e.g. `before:14` or `after:7`. */
export function renewalNoticeKey(notice: RenewalNotice): string {
  return `${notice.kind}:${notice.days}`;
}
