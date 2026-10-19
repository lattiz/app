import type Stripe from 'stripe';
import { scheduledCancellation } from '../../../common/billing/scheduled-cancellation';
import { resolvePlanFromLookupKey } from '../../billing/billing.constants';
import type {
  AdminSubscriptionDiscountDto,
  AdminSubscriptionInvoiceDto,
  AdminSubscriptionListItemDto,
  AdminSubscriptionPaymentMethodDto,
  AdminSubscriptionPriceDto,
  AdminSubscriptionScheduleDto,
  AdminSubscriptionSchedulePhaseDto,
  AdminSubscriptionStripeDto,
  AdminSubscriptionUpcomingInvoiceDto,
  BillingPeriod,
  SubscriptionPlan,
  SubscriptionStatus,
} from './admin-subscriptions.dto';
import {
  INVOICE_STATUSES,
  PRICE_INTERVALS,
  SCHEDULE_STATUSES,
  SUBSCRIPTION_STATUSES,
} from './admin-subscriptions.dto';

export interface SubscriptionOverviewRow {
  id: string;
  tenant_id: string;
  stripe_subscription_id: string;
  plan: string;
  billing_period: string;
  status: string;
  current_period_end: string | Date | null;
  cancel_at_period_end: boolean | null;
  cancel_at: string | Date | null;
  payment_attempts: number | string | null;
  created_at: string | Date;
  canceled_at: string | Date | null;
  tenant_slug: string;
  tenant_name: string;
  email: string | null;
}

/** Test keys use the /test dashboard path. Only the prefix is read; the key is never logged. */
export function subscriptionDashboardUrl(stripeSubscriptionId: string): string {
  const testMode = (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_');
  const prefix = testMode ? '/test' : '';
  return `https://dashboard.stripe.com${prefix}/subscriptions/${encodeURIComponent(stripeSubscriptionId)}`;
}

export function mapSubscriptionItem(
  row: SubscriptionOverviewRow,
): AdminSubscriptionListItemDto {
  const scheduled = scheduledCancellation({
    status: row.status,
    cancel_at: row.cancel_at,
    cancel_at_period_end: row.cancel_at_period_end === true,
    current_period_end: row.current_period_end,
  });
  return {
    id: row.id,
    stripeSubscriptionId: row.stripe_subscription_id,
    tenant: {
      id: row.tenant_id,
      slug: row.tenant_slug,
      name: row.tenant_name,
      email: row.email,
    },
    plan: row.plan as SubscriptionPlan,
    period: row.billing_period as BillingPeriod,
    status: row.status as SubscriptionStatus,
    currentPeriodEnd: toIso(row.current_period_end),
    cancelAt: scheduled.cancelAt,
    cancelAtPeriodEnd: scheduled.cancelAtPeriodEnd,
    paymentAttempts: toInt(row.payment_attempts) ?? 0,
    createdAt: toIsoRequired(row.created_at),
    canceledAt: toIso(row.canceled_at),
    stripeDashboardUrl: subscriptionDashboardUrl(row.stripe_subscription_id),
  };
}

export function mapStripeDetail(input: {
  subscription: Stripe.Subscription;
  invoices: Stripe.Invoice[];
  schedule: Stripe.SubscriptionSchedule | null;
  upcoming: Stripe.Invoice | null;
}): AdminSubscriptionStripeDto {
  const item = input.subscription.items?.data?.[0];
  return {
    status: asStatus(input.subscription.status),
    price: item ? mapPrice(item.price, discountOf(input.subscription)) : null,
    paymentMethod: paymentMethodOf(input.subscription),
    upcomingInvoice: mapUpcoming(input.upcoming),
    schedule: input.schedule ? mapSchedule(input.schedule) : null,
    invoices: input.invoices.map(mapInvoice),
  };
}

/** No upcoming invoice once Stripe has fully ended the subscription. */
export function subscriptionHasUpcomingInvoice(
  subscription: Stripe.Subscription,
): boolean {
  return (
    subscription.status !== 'canceled' &&
    subscription.status !== 'incomplete_expired'
  );
}

function mapPrice(
  price: Stripe.Price,
  discount: AdminSubscriptionDiscountDto | null,
): AdminSubscriptionPriceDto {
  const recurring = price.recurring;
  return {
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: asInterval(recurring?.interval ?? null),
    intervalCount: recurring?.interval_count ?? null,
    discount,
  };
}

function discountOf(
  subscription: Stripe.Subscription,
): AdminSubscriptionDiscountDto | null {
  const first = subscription.discounts?.[0];
  if (!first) return null;
  if (typeof first === 'string') {
    return { percentOff: null, amountOff: null, currency: null };
  }
  const coupon = first.source?.coupon;
  if (!coupon || typeof coupon === 'string') {
    return { percentOff: null, amountOff: null, currency: null };
  }
  return {
    percentOff: coupon.percent_off,
    amountOff: coupon.amount_off,
    currency: coupon.currency,
  };
}

function paymentMethodOf(
  subscription: Stripe.Subscription,
): AdminSubscriptionPaymentMethodDto | null {
  const onSubscription = cardOf(subscription.default_payment_method);
  if (onSubscription) return onSubscription;
  if (!isLiveCustomer(subscription.customer)) return null;
  return cardOf(
    subscription.customer.invoice_settings?.default_payment_method ?? null,
  );
}

function cardOf(
  method: string | Stripe.PaymentMethod | null | undefined,
): AdminSubscriptionPaymentMethodDto | null {
  if (!method || typeof method === 'string') return null;
  const card = method.type === 'card' ? method.card : null;
  if (!card?.brand || !card.last4) return null;
  return {
    brand: card.brand,
    last4: card.last4,
    expMonth: card.exp_month,
    expYear: card.exp_year,
  };
}

function mapUpcoming(
  invoice: Stripe.Invoice | null,
): AdminSubscriptionUpcomingInvoiceDto | null {
  if (!invoice) return null;
  const unix =
    invoice.next_payment_attempt ?? invoice.due_date ?? invoice.period_end;
  return {
    total: invoice.total,
    currency: invoice.currency,
    date: unixToIso(unix),
  };
}

function mapSchedule(
  schedule: Stripe.SubscriptionSchedule,
): AdminSubscriptionScheduleDto {
  const phases = schedule.phases.toSorted(
    (left, right) => left.start_date - right.start_date,
  );
  return {
    id: schedule.id,
    status: asScheduleStatus(schedule.status),
    phases: phases.flatMap((phase) => {
      const mapped = mapPhase(phase);
      return mapped ? [mapped] : [];
    }),
  };
}

function mapPhase(
  phase: Stripe.SubscriptionSchedule.Phase,
): AdminSubscriptionSchedulePhaseDto | null {
  const price = phase.items[0]?.price;
  const start = unixToIso(phase.start_date);
  const end = unixToIso(phase.end_date);
  if (!price || !start || !end) return null;
  const ref = priceRef(price);
  return {
    plan: ref.plan,
    priceId: ref.priceId,
    start,
    end,
  };
}

function priceRef(price: Stripe.SubscriptionSchedule.Phase.Item['price']): {
  plan: SubscriptionPlan | null;
  priceId: string;
} {
  if (typeof price === 'string') return { plan: null, priceId: price };
  if ('deleted' in price && price.deleted) {
    return { plan: null, priceId: price.id };
  }
  const resolved = price.lookup_key
    ? resolvePlanFromLookupKey(price.lookup_key)
    : null;
  return { plan: resolved?.plan ?? null, priceId: price.id };
}

function mapInvoice(invoice: Stripe.Invoice): AdminSubscriptionInvoiceDto {
  return {
    number: invoice.number,
    status: asInvoiceStatus(invoice.status),
    total: invoice.total,
    currency: invoice.currency,
    createdAt: requireUnix(invoice.created),
    paidAt: unixToIso(invoice.status_transitions?.paid_at),
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
  };
}

function isLiveCustomer(
  customer: Stripe.Subscription['customer'],
): customer is Stripe.Customer {
  return (
    typeof customer !== 'string' && !('deleted' in customer && customer.deleted)
  );
}

function asStatus(status: string): SubscriptionStatus {
  if ((SUBSCRIPTION_STATUSES as readonly string[]).includes(status)) {
    return status as SubscriptionStatus;
  }
  throw new Error(`Unexpected Stripe subscription status: ${status}`);
}

function asInterval(
  interval: string | null,
): AdminSubscriptionPriceDto['interval'] {
  if (interval && (PRICE_INTERVALS as readonly string[]).includes(interval)) {
    return interval as AdminSubscriptionPriceDto['interval'];
  }
  return null;
}

function asInvoiceStatus(
  status: string | null,
): AdminSubscriptionInvoiceDto['status'] {
  if (status && (INVOICE_STATUSES as readonly string[]).includes(status)) {
    return status as AdminSubscriptionInvoiceDto['status'];
  }
  return null;
}

function asScheduleStatus(
  status: string,
): AdminSubscriptionScheduleDto['status'] {
  if ((SCHEDULE_STATUSES as readonly string[]).includes(status)) {
    return status as AdminSubscriptionScheduleDto['status'];
  }
  throw new Error(`Unexpected Stripe schedule status: ${status}`);
}

function toInt(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

function toIso(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toIsoRequired(value: string | Date): string {
  const iso = toIso(value);
  if (!iso) throw new Error('Expected a timestamp');
  return iso;
}

function unixToIso(seconds: number | null | undefined): string | null {
  if (seconds == null) return null;
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function requireUnix(seconds: number): string {
  const iso = unixToIso(seconds);
  if (!iso) throw new Error('Expected a unix timestamp');
  return iso;
}
