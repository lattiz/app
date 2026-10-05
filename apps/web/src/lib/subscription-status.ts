import { formatDate } from './format';

export interface SubscriptionPeriodFields {
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  currentPeriodEnd: string | null;
}

export interface SubscriptionPeriodDisplay {
  isCanceling: boolean;
  /** ISO date shown in the period row (`cancelAt ?? currentPeriodEnd` when canceling). */
  displayDate: string | null;
  dateShort: string;
  dateLong: string;
  periodLabel: 'Termina el' | 'Próximo cobro';
}

export function formatDateLong(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Shared period-row + warning copy inputs for scheduled cancellations. */
export function getSubscriptionPeriodDisplay(
  fields: SubscriptionPeriodFields,
): SubscriptionPeriodDisplay {
  const isCanceling = fields.cancelAtPeriodEnd;
  const displayDate = isCanceling
    ? (fields.cancelAt ?? fields.currentPeriodEnd)
    : fields.currentPeriodEnd;

  return {
    isCanceling,
    displayDate,
    dateShort: formatDate(displayDate),
    dateLong: formatDateLong(displayDate),
    periodLabel: isCanceling ? 'Termina el' : 'Próximo cobro',
  };
}

export function cancelingStatusBadgeText(dateShort: string): string {
  return `Se cancela el ${dateShort}`;
}
