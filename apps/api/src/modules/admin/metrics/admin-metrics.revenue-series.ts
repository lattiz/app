import { mexicoCityMonthKey } from './admin-metrics.calendar';

const GROSS_TYPES = new Set(['charge', 'payment']);
const REFUND_TYPES = new Set(['refund', 'payment_refund']);

export interface BalanceTxn {
  type: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  /** Unix seconds, as Stripe sends `created`. */
  created: number;
}

export interface RevenuePoint {
  month: string;
  currency: string;
  grossCents: number;
  feeCents: number;
  refundCents: number;
  netCents: number;
}

/**
 * Charges and payments are gross. Refund amounts stay negative.
 * The month is the Mexico City calendar month of `created`.
 */
export function groupRevenueByMonth(
  transactions: readonly BalanceTxn[],
  monthKeys: readonly string[],
): RevenuePoint[] {
  const allowed = new Set(monthKeys);
  const buckets = new Map<string, RevenuePoint>();
  for (const txn of transactions) {
    const gross = GROSS_TYPES.has(txn.type);
    const refund = REFUND_TYPES.has(txn.type);
    if (!gross && !refund) continue;
    const month = mexicoCityMonthKey(new Date(txn.created * 1000));
    if (!allowed.has(month)) continue;
    const currency = txn.currency.toLowerCase();
    const key = `${month}:${currency}`;
    const point = buckets.get(key) ?? emptyPoint(month, currency);
    if (gross) point.grossCents += txn.amount;
    if (refund) point.refundCents += txn.amount;
    point.feeCents += txn.fee;
    point.netCents += txn.net;
    buckets.set(key, point);
  }

  const currencies = [
    ...new Set([...buckets.values()].map((point) => point.currency)),
  ].toSorted();
  const points: RevenuePoint[] = [];
  for (const month of monthKeys) {
    for (const currency of currencies) {
      points.push(
        buckets.get(`${month}:${currency}`) ?? emptyPoint(month, currency),
      );
    }
  }
  return points;
}

function emptyPoint(month: string, currency: string): RevenuePoint {
  return {
    month,
    currency,
    grossCents: 0,
    feeCents: 0,
    refundCents: 0,
    netCents: 0,
  };
}
