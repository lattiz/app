import type {
  AdminSubscriptionDiscountDto,
  AdminSubscriptionInvoiceDto,
  AdminSubscriptionPriceDto,
  AdminSubscriptionScheduleDto,
} from '@lattiz/api-client';
import { formatCount, formatDate, formatMoney } from '@/lib/format';
import {
  subscriptionBadge,
  type StatusBadge,
} from '@/features/tenants/labels';

const INVOICE_STATUS: Record<
  NonNullable<AdminSubscriptionInvoiceDto['status']>,
  StatusBadge
> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  open: { label: 'Por pagar', tone: 'warn' },
  paid: { label: 'Pagada', tone: 'good' },
  uncollectible: { label: 'No se pudo cobrar', tone: 'bad' },
  void: { label: 'Anulada', tone: 'neutral' },
};

const SCHEDULE_STATUS: Record<AdminSubscriptionScheduleDto['status'], string> = {
  not_started: 'Aún no empieza',
  active: 'En curso',
  completed: 'Ya aplicado',
  released: 'Ya no está programado',
  canceled: 'Cancelado',
};

const INTERVAL: Record<
  NonNullable<AdminSubscriptionPriceDto['interval']>,
  [singular: string, plural: string]
> = {
  day: ['día', 'días'],
  week: ['semana', 'semanas'],
  month: ['mes', 'meses'],
  year: ['año', 'años'],
};

const MISSING_INVOICE: StatusBadge = { label: 'Sin estado', tone: 'neutral' };

export function invoiceBadge(
  status: AdminSubscriptionInvoiceDto['status'],
): StatusBadge {
  if (!status) return MISSING_INVOICE;
  return INVOICE_STATUS[status];
}

export function scheduleStatusLabel(
  status: AdminSubscriptionScheduleDto['status'],
): string {
  return SCHEDULE_STATUS[status];
}

export function cancellationLabel(input: {
  cancelAt: string | null;
  cancelAtPeriodEnd: boolean;
}): string {
  if (input.cancelAt) return `El ${formatDate(input.cancelAt)}`;
  if (input.cancelAtPeriodEnd) return 'Al terminar el periodo';
  return 'No';
}

export function priceIntervalLabel(
  interval: AdminSubscriptionPriceDto['interval'],
  intervalCount: number | null,
): string {
  if (!interval) return 'sin periodo fijo';
  const [singular, plural] = INTERVAL[interval];
  const count = intervalCount && intervalCount > 0 ? intervalCount : 1;
  if (count === 1) return `cada ${singular}`;
  return `cada ${formatCount(count)} ${plural}`;
}

export function discountLabel(discount: AdminSubscriptionDiscountDto | null): string | null {
  if (!discount) return null;
  if (discount.percentOff != null) {
    const percent = new Intl.NumberFormat('es-MX', {
      maximumFractionDigits: 2,
    }).format(discount.percentOff);
    return `${percent}% de descuento`;
  }
  if (discount.amountOff != null && discount.currency) {
    return `${formatMoney(discount.amountOff, discount.currency)} de descuento`;
  }
  return null;
}

export function priceText(price: AdminSubscriptionPriceDto | null): string {
  if (!price || price.unitAmount == null) return 'Sin precio';
  const amount = formatMoney(price.unitAmount, price.currency);
  const interval = priceIntervalLabel(price.interval, price.intervalCount);
  const discount = discountLabel(price.discount);
  if (discount) return `${amount} ${interval}, ${discount}`;
  return `${amount} ${interval}`;
}

export function cardBrandLabel(brand: string): string {
  const trimmed = brand.trim();
  if (!trimmed) return 'Tarjeta';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export { subscriptionBadge };
