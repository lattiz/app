/**
 * Derives the client-facing scheduled-cancellation fields from a subscriptions row.
 * Supports both Stripe shapes: `cancel_at` (dahlia+) and `cancel_at_period_end` (older).
 */
const TERMINAL_STATUSES = new Set(['canceled', 'unpaid', 'incomplete_expired']);

export function scheduledCancellation(row: {
  status: string;
  cancel_at: string | Date | null;
  cancel_at_period_end: boolean;
  current_period_end: string | Date | null;
}): { cancelAt: string | null; cancelAtPeriodEnd: boolean } {
  if (TERMINAL_STATUSES.has(row.status)) {
    return { cancelAt: null, cancelAtPeriodEnd: false };
  }

  const scheduled = row.cancel_at_period_end === true || row.cancel_at != null;
  if (!scheduled) {
    return { cancelAt: null, cancelAtPeriodEnd: false };
  }

  const cancelAt = row.cancel_at
    ? toIso(row.cancel_at)
    : row.cancel_at_period_end && row.current_period_end
      ? toIso(row.current_period_end)
      : null;

  return { cancelAt, cancelAtPeriodEnd: true };
}

function toIso(value: string | Date): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}
