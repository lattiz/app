/**
 * Single source of truth for "can this tenant use the service right now".
 * Status alone is not trustworthy — it lags behind `current_period_end`
 * whenever a Stripe webhook is missed, so the date is checked too.
 */
export function computeIsEntitled(
  sub: {
    status: string | null;
    currentPeriodEnd: string | Date | null;
  } | null,
): boolean {
  if (!sub?.status || !sub.currentPeriodEnd) return false;
  const validStatus = sub.status === 'active' || sub.status === 'trialing';
  const periodStillValid = new Date(sub.currentPeriodEnd) > new Date();
  return validStatus && periodStillValid;
}
