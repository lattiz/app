export type StatusTone = 'neutral' | 'good' | 'warn' | 'bad' | 'info';

export type StatusBadge = {
  label: string;
  tone: StatusTone;
};

export const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  neutral: 'border-border bg-muted text-foreground',
  good: 'border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  warn: 'border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300',
  bad: 'border-transparent bg-destructive/10 text-destructive',
  info: 'border-transparent bg-sky-500/15 text-sky-800 dark:text-sky-300',
};

const MISSING: StatusBadge = { label: 'Sin dato', tone: 'neutral' };

const PLAN: Record<string, StatusBadge> = {
  none: { label: 'Sin plan', tone: 'neutral' },
  basico: { label: 'Básico', tone: 'neutral' },
  pro: { label: 'Pro', tone: 'info' },
  trial: { label: 'Prueba', tone: 'info' },
};

const TENANT_STATUS: Record<string, StatusBadge> = {
  active: { label: 'Activo', tone: 'good' },
  inactive: { label: 'Inactivo', tone: 'warn' },
  cancelled: { label: 'Cancelado', tone: 'bad' },
};

const PREVIEW: Record<string, StatusBadge> = {
  paid: { label: 'De pago', tone: 'good' },
  trial_unstarted: { label: 'Prueba sin empezar', tone: 'neutral' },
  trial_active: { label: 'En prueba', tone: 'info' },
  trial_expired: { label: 'Prueba vencida', tone: 'warn' },
  lapsed: { label: 'Sin acceso', tone: 'bad' },
};

const SUBSCRIPTION: Record<string, StatusBadge> = {
  active: { label: 'Al día', tone: 'good' },
  trialing: { label: 'En periodo de prueba', tone: 'info' },
  past_due: { label: 'Pago atrasado', tone: 'warn' },
  canceled: { label: 'Cancelada', tone: 'bad' },
  incomplete: { label: 'Pago incompleto', tone: 'warn' },
  incomplete_expired: { label: 'Pago no completado', tone: 'bad' },
  unpaid: { label: 'Sin pagar', tone: 'bad' },
  paused: { label: 'En pausa', tone: 'neutral' },
};

const DNS: Record<string, StatusBadge> = {
  pending: { label: 'Pendiente', tone: 'warn' },
  configuring: { label: 'Configurando', tone: 'info' },
  propagating: { label: 'Propagando', tone: 'info' },
  active: { label: 'Activo', tone: 'good' },
  error: { label: 'Con error', tone: 'bad' },
};

const RENEWAL: Record<string, StatusBadge> = {
  pricing_pending: { label: 'Precio por confirmar', tone: 'warn' },
  open: { label: 'Cobro abierto', tone: 'info' },
  overdue: { label: 'En mora', tone: 'bad' },
  paid: { label: 'Pagado', tone: 'good' },
  renewed: { label: 'Renovado', tone: 'good' },
  renewal_failed: { label: 'Falló la renovación', tone: 'bad' },
  over_cap: { label: 'Por encima del tope', tone: 'warn' },
  lapsed: { label: 'Vencido sin renovar', tone: 'bad' },
  refunded: { label: 'Reembolsado', tone: 'neutral' },
  void: { label: 'Anulado', tone: 'neutral' },
};

const REGISTRAR: Record<string, StatusBadge> = {
  active: { label: 'Activo', tone: 'good' },
  expired: { label: 'Vencido', tone: 'bad' },
  pending: { label: 'Pendiente', tone: 'warn' },
  unknown: { label: 'Sin confirmar', tone: 'neutral' },
};

const ZONE: Record<string, StatusBadge> = {
  active: { label: 'Activa', tone: 'good' },
  pending: { label: 'Pendiente', tone: 'warn' },
  initializing: { label: 'Preparando', tone: 'info' },
  moved: { label: 'Movida', tone: 'warn' },
  deactivated: { label: 'Desactivada', tone: 'bad' },
  deleted: { label: 'Eliminada', tone: 'bad' },
};

const EMAIL_STATUS: Record<string, StatusBadge> = {
  pending: { label: 'En espera', tone: 'warn' },
  sending: { label: 'Enviando', tone: 'info' },
  sent: { label: 'Enviado', tone: 'good' },
  failed: { label: 'Falló', tone: 'bad' },
};

const EMAIL_KIND: Record<string, string> = {
  welcome: 'Bienvenida',
  payment_failed: 'Pago fallido',
  site_suspended: 'Sitio suspendido',
  site_reactivated: 'Sitio reactivado',
  domain_ready: 'Dominio listo',
  domain_purchase_failed: 'Compra de dominio fallida',
  account_deleted: 'Cuenta eliminada',
  renewal_upcoming: 'Renovación próxima',
  renewal_last_notice: 'Último aviso de renovación',
  domain_renewed: 'Dominio renovado',
  domain_expired: 'Dominio vencido',
  domain_lost: 'Dominio perdido',
  admin_alert: 'Aviso interno',
  preview_ending: 'La prueba está por terminar',
};

const BILLING_PERIOD: Record<string, string> = {
  monthly: 'Mensual',
  annual: 'Anual',
};

const SITE: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
};

const DOMAIN_SOURCE: Record<string, string> = {
  lattiz_managed: 'Lo compró Lattiz',
  godaddy_managed: 'Lo compró Lattiz',
  user_provided: 'Lo conectó el cliente',
};

const AUTO_RENEW: Record<string, string> = {
  on: 'Encendida',
  off: 'Apagada',
  default: 'La del registrador',
};

const PAY_BLOCK: Record<string, string> = {
  subscription_inactive: 'No se puede cobrar porque la suscripción no está activa.',
  window_closed: 'Todavía no abre la ventana de cobro.',
};

export function planBadge(plan: string | null | undefined): StatusBadge {
  return lookup(plan, PLAN);
}

export function tenantStatusBadge(status: string | null | undefined): StatusBadge {
  return lookup(status, TENANT_STATUS);
}

export function previewBadge(state: string | null | undefined): StatusBadge {
  return lookup(state, PREVIEW);
}

export function subscriptionBadge(status: string | null | undefined): StatusBadge {
  return lookup(status, SUBSCRIPTION);
}

export function dnsBadge(status: string | null | undefined): StatusBadge {
  return lookup(status, DNS);
}

export function renewalBadge(status: string | null | undefined): StatusBadge {
  return lookup(status, RENEWAL);
}

export function registrarBadge(status: string | null | undefined): StatusBadge {
  return lookup(status, REGISTRAR);
}

export function zoneBadge(status: string | null | undefined): StatusBadge {
  if (!status) return MISSING;
  return ZONE[status] ?? { label: status, tone: 'neutral' };
}

export function emailStatusBadge(status: string | null | undefined): StatusBadge {
  return lookup(status, EMAIL_STATUS);
}

export function emailKindLabel(kind: string): string {
  return EMAIL_KIND[kind] ?? kind;
}

export function billingPeriodLabel(period: string | null | undefined): string {
  if (!period) return 'Sin periodo';
  return BILLING_PERIOD[period] ?? period;
}

export function siteStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Sin sitio';
  return SITE[status] ?? status;
}

export function domainSourceLabel(source: string | null | undefined): string {
  if (!source) return 'Sin origen';
  return DOMAIN_SOURCE[source] ?? source;
}

export function autoRenewLabel(value: string | null | undefined): string {
  if (!value) return 'Sin dato';
  return AUTO_RENEW[value] ?? value;
}

export function payBlockedLabel(reason: string | null | undefined): string | null {
  if (!reason) return null;
  return PAY_BLOCK[reason] ?? 'No se puede cobrar ahora.';
}

export function publishedLabel(published: boolean): string {
  return published ? 'Sí' : 'No';
}

/** Días de calendario en Ciudad de México entre hoy y ese instante. */
export function daysUntil(iso: string | null | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  return zonedDayNumber(target) - zonedDayNumber(now);
}

/** Titular de la ficha: «Faltan N días», «Vence hoy» o «Venció hace N días». */
export function daysRemainingText(days: number): string {
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Falta 1 día';
  if (days > 1) return `Faltan ${days} días`;
  if (days === -1) return 'Venció hace 1 día';
  return `Venció hace ${Math.abs(days)} días`;
}

/** Columna de la lista: «Vence en N días». */
export function domainExpiryListText(days: number): string {
  if (days < 0) return daysRemainingText(days);
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence en 1 día';
  return `Vence en ${days} días`;
}

export function domainExpiryIsUrgent(days: number | null): boolean {
  return days !== null && days <= 30;
}

const TIME_ZONE = 'America/Mexico_City';

function lookup(value: string | null | undefined, map: Record<string, StatusBadge>): StatusBadge {
  if (!value) return MISSING;
  return map[value] ?? MISSING;
}

function zonedDayNumber(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = Number(part(parts, 'year'));
  const month = Number(part(parts, 'month'));
  const day = Number(part(parts, 'day'));
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function part(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((item) => item.type === type)?.value ?? '0';
}
