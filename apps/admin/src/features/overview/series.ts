import type {
  MetricsFunnelDto,
  MetricsHistoryItemDto,
  MetricsMrrPlanDto,
  MetricsRevenueMonthDto,
} from '@lattiz/api-client';
import {
  formatCount,
  formatDay,
  formatMoney,
  formatMonth,
  formatMonthShort,
} from '@/lib/format';

export type RevenueChartPoint = {
  month: string;
  label: string;
  monthLabel: string;
  netCents: number;
  grossCents: number;
  feeCents: number;
  refundCents: number;
  currency: string;
};

export type TrendChartPoint = {
  day: string;
  label: string;
  mrrCents: number | null;
  payingTenants: number;
  currency: string | null;
};

export type FunnelStep = {
  id: 'signups' | 'choseTemplate' | 'published' | 'paid';
  label: string;
  count: number;
  rate: number | null;
};

const PLAN_LABEL: Record<MetricsMrrPlanDto['plan'], string> = {
  basico: 'Básico',
  pro: 'Pro',
};

/**
 * The generated type is only `'unavailable'`. The API sends null when Stripe
 * answered, so a truthy check on the raw field would always look like a failure.
 */
export function stripeRevenueFailed(
  revenueError: string | null | undefined,
): boolean {
  return typeof revenueError === 'string' && revenueError.length > 0;
}

export function toRevenueSeries(
  items: readonly MetricsRevenueMonthDto[],
): RevenueChartPoint[] {
  return [...items]
    .sort((left, right) => left.month.localeCompare(right.month))
    .map((item) => ({
      month: item.month,
      label: formatMonthShort(item.month),
      monthLabel: formatMonth(item.month),
      netCents: item.netCents,
      grossCents: item.grossCents,
      feeCents: item.feeCents,
      refundCents: item.refundCents,
      currency: item.currency,
    }));
}

export function seriesCurrency(items: readonly { currency: string }[]): string {
  return items.find((item) => item.currency)?.currency ?? 'mxn';
}

export function mixedCurrency(items: readonly { currency: string }[]): boolean {
  const first = items[0]?.currency;
  if (!first) return false;
  return items.some((item) => item.currency !== first);
}

export function toTrendSeries(
  items: readonly MetricsHistoryItemDto[],
): TrendChartPoint[] {
  return [...items]
    .sort((left, right) => left.day.localeCompare(right.day))
    .map((item) => ({
      day: item.day,
      label: formatDay(item.day),
      mrrCents: item.mrrCents,
      payingTenants: item.payingTenants,
      currency: item.currency,
    }));
}

export function trendReady(points: readonly unknown[]): boolean {
  return points.length >= 2;
}

export function trendCurrency(points: readonly TrendChartPoint[]): string {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const currency = points[index]?.currency;
    if (currency) return currency;
  }
  return 'mxn';
}

export function toFunnelSteps(funnel: MetricsFunnelDto): FunnelStep[] {
  return [
    {
      id: 'signups',
      label: 'Se registró',
      count: funnel.signups,
      rate: null,
    },
    {
      id: 'choseTemplate',
      label: 'Eligió plantilla',
      count: funnel.choseTemplate,
      rate: funnel.choseTemplateRate,
    },
    {
      id: 'published',
      label: 'Publicó',
      count: funnel.published,
      rate: funnel.publishedRate,
    },
    {
      id: 'paid',
      label: 'Pagó',
      count: funnel.paid,
      rate: funnel.paidRate,
    },
  ];
}

export function funnelBarWidth(count: number, max: number): number {
  if (max <= 0 || count <= 0) return 0;
  return Math.min(100, (count / max) * 100);
}

/** Median hours → the plain sentence, or null when there is no median. */
export function medianPayPhrase(hours: number | null): string | null {
  if (hours == null || !Number.isFinite(hours) || hours < 0) return null;
  const days = Math.max(1, Math.ceil(hours / 24));
  const unit = days === 1 ? 'día' : 'días';
  return `La mitad paga en menos de ${days} ${unit}`;
}

export function planBreakdown(
  plans: readonly MetricsMrrPlanDto[],
  currency: string,
): string | null {
  const parts = plans
    .filter((plan) => plan.mrrCents > 0)
    .map(
      (plan) =>
        `${PLAN_LABEL[plan.plan]} ${formatMoney(plan.mrrCents, currency)}`,
    );
  if (parts.length === 0) return null;
  return parts.join(' · ');
}

export function expiringTrialsLabel(count: number): string {
  if (count === 1) return '1 vence en 48 h';
  return `${formatCount(count)} vencen en 48 h`;
}

export function payingMovementLabel(
  created: number,
  cancelled: number,
): string {
  const createdLabel =
    created === 1 ? '1 nuevo' : `${formatCount(created)} nuevos`;
  const cancelledLabel =
    cancelled === 1
      ? '1 cancelación'
      : `${formatCount(cancelled)} cancelaciones`;
  return `${createdLabel} · ${cancelledLabel} este mes`;
}
