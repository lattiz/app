import type { DomainRenewalStatusDto } from '@lattiz/api-client';
import { formatMoney } from '@/lib/format';

const DAY_MS = 86_400_000;
const PAY_CTA = 'Pagar renovación';
const REACTIVATE_CTA = 'Reactivar plan';

export interface DomainRenewalCopy {
  tone: 'info' | 'warning' | 'destructive';
  title: string;
  description: string;
  cta: string | null;
  showAmount: boolean;
}

/** Whole days from `now` until `iso`, rounded up. Zero when the date cannot be read. */
export function daysUntil(iso: string, now: Date): number {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return 0;
  return Math.ceil((target - now.getTime()) / DAY_MS);
}

export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function renewalAmountLine(renewal: DomainRenewalStatusDto): string {
  const { baseCents, taxCents, totalCents, currency } = renewal;
  return `Cuota anual ${formatMoney(baseCents, currency)} + IVA ${formatMoney(taxCents, currency)} = ${formatMoney(totalCents, currency)} ${currency.toUpperCase()}`;
}

export function domainRenewalCopy(
  renewal: DomainRenewalStatusDto,
  now: Date,
): DomainRenewalCopy {
  const base = baseCopy(renewal, now);
  return {
    ...base,
    description: withBlockedReason(base.description, renewal),
    cta: ctaFor(renewal),
    showAmount: showsAmount(renewal),
  };
}

function baseCopy(
  renewal: DomainRenewalStatusDto,
  now: Date,
): Pick<DomainRenewalCopy, 'tone' | 'title' | 'description'> {
  if (renewal.status === 'paid') {
    return {
      tone: 'info',
      title: 'Pago recibido',
      description:
        'Estamos renovando tu dominio; esto suele tardar unos minutos.',
    };
  }
  if (renewal.status === 'renewal_failed') {
    return {
      tone: 'warning',
      title: 'Estamos renovando tu dominio',
      description:
        'Recibimos tu pago y nuestro equipo está completando la renovación; te escribiremos por correo.',
    };
  }
  if (renewal.status === 'overdue') {
    const expired = formatLongDate(renewal.expiresAt);
    const deadline = renewal.lateDeadlineAt
      ? ` Puedes pagar hasta el ${formatLongDate(renewal.lateDeadlineAt)} para recuperar tu dominio y tu sitio.`
      : ' Puedes pagar para recuperar tu dominio y tu sitio.';
    return {
      tone: 'destructive',
      title: 'Tu sitio está fuera de línea',
      description: `Tu dominio venció el ${expired}.${deadline} Después el dominio se pierde definitivamente.`,
    };
  }

  const days = daysUntil(renewal.expiresAt, now);
  const date = formatLongDate(renewal.expiresAt);
  const remaining =
    days <= 0 ? 'hoy' : days === 1 ? 'falta 1 día' : `faltan ${days} días`;
  return {
    tone: days > 7 ? 'info' : 'warning',
    title:
      days > 7
        ? 'Renueva tu dominio'
        : days <= 0
          ? 'Tu dominio vence hoy'
          : `Tu dominio vence en ${days} ${days === 1 ? 'día' : 'días'}`,
    description: `Tu dominio vence el ${date} (${remaining}). Si no lo renuevas, ese día tu sitio, su dirección de Lattiz y el correo de tu dominio dejan de funcionar.`,
  };
}

function withBlockedReason(
  description: string,
  renewal: DomainRenewalStatusDto,
): string {
  if (renewal.status === 'paid' || renewal.status === 'renewal_failed') {
    return description;
  }
  if (renewal.payBlockedReason === 'subscription_inactive') {
    return `${description} Para pagar la renovación primero reactiva tu plan.`;
  }
  if (renewal.payBlockedReason === 'window_closed') {
    return `${description} El plazo para renovar terminó.`;
  }
  return description;
}

function ctaFor(renewal: DomainRenewalStatusDto): string | null {
  if (renewal.status === 'paid' || renewal.status === 'renewal_failed') {
    return null;
  }
  if (renewal.payBlockedReason === 'window_closed') return null;
  if (renewal.payBlockedReason === 'subscription_inactive')
    return REACTIVATE_CTA;
  if (renewal.canPay) return PAY_CTA;
  return null;
}

function showsAmount(renewal: DomainRenewalStatusDto): boolean {
  if (renewal.status !== 'open' && renewal.status !== 'overdue') return false;
  return renewal.payBlockedReason !== 'window_closed';
}
