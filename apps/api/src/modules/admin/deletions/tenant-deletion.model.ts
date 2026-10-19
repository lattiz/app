import type { DnsProviderName } from '../../domains/domain/dns-provider.port';
import type { RegistrarAutoRenew } from '../../domains/domain/registrar.port';
import type {
  DomainInspection,
  ManagedRenewalInspection,
} from '../../domains/domain-inspection';

/** A running job with no write for this long can be claimed again. */
export const DELETION_CLAIM_STALE_MS = 10 * 60 * 1000;

/** A pending job nobody claimed for this long can be retried. */
export const DELETION_PENDING_STALE_MS = 2 * 60 * 1000;

export const DELETION_STEP_KEYS = [
  'offline',
  'stripe',
  'domain',
  'registrar',
  'analytics',
  'storage',
  'emails',
  'account',
  'verify',
] as const;

export type DeletionStepKey = (typeof DELETION_STEP_KEYS)[number];

export type DeletionStepStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'skipped'
  | 'manual'
  | 'failed';

export type DeletionJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'completed_manual'
  | 'failed';

export interface DeletionStep {
  key: DeletionStepKey;
  status: DeletionStepStatus;
  startedAt: string | null;
  finishedAt: string | null;
  detail: string | null;
  error: string | null;
}

export interface DeletionDomainSnapshot {
  name: string;
  source: string;
  registrarDomainId: string | null;
  expiresAt: string | null;
  dnsProvider: DnsProviderName | null;
  dnsZoneId: string | null;
  autoRenew: RegistrarAutoRenew | null;
  renewalDate: string | null;
  vercelInProject: boolean | null;
}

/** Identifiers taken before anything is released. The raw email is not here. */
export interface DeletionSnapshot {
  tenantId: string;
  userId: string;
  slug: string;
  emailMasked: string | null;
  domain: DeletionDomainSnapshot | null;
  ga4PropertyId: string | null;
  analyticsIsMock: boolean;
  stripeCustomerId: string | null;
  subscriptionIds: string[];
  r2Bytes: number;
  r2Objects: number;
  pendingEmails: number;
}

export interface DeletionJob {
  id: string;
  tenantId: string;
  userId: string;
  slug: string;
  snapshot: DeletionSnapshot;
  notifyEmail: string | null;
  notifyCustomer: boolean;
  status: DeletionJobStatus;
  steps: DeletionStep[];
  reason: string;
  actorUserId: string;
  actorEmail: string | null;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

export interface StepOutcome {
  status: 'done' | 'skipped' | 'manual' | 'failed';
  detail: string | null;
  error: string | null;
}

export const WHAT_IS_KEPT = [
  'El cliente, las facturas y los cobros en Stripe',
  'El dominio registrado hasta su vencimiento',
  'Los correos ya enviados',
  'La auditoría y este trabajo de borrado',
] as const;

const TERMINAL_STEP = new Set<DeletionStepStatus>([
  'done',
  'skipped',
  'manual',
]);

const MEXICO_CITY = 'America/Mexico_City';
const dayFormat = new Intl.DateTimeFormat('es-MX', {
  timeZone: MEXICO_CITY,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf('@');
  if (at <= 0 || at === trimmed.length - 1) return '***';
  return `${trimmed[0]}***@${trimmed.slice(at + 1)}`;
}

export function pendingStep(key: DeletionStepKey): DeletionStep {
  return {
    key,
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    detail: null,
    error: null,
  };
}

export function initialSteps(): DeletionStep[] {
  return DELETION_STEP_KEYS.map((key) => pendingStep(key));
}

export function normalizeSteps(raw: unknown): DeletionStep[] {
  const list = Array.isArray(raw) ? raw : [];
  const byKey = new Map<string, DeletionStep>();
  for (const item of list) {
    if (!item || typeof item !== 'object' || !('key' in item)) continue;
    const key = String((item as { key: unknown }).key);
    byKey.set(key, item as DeletionStep);
  }
  return DELETION_STEP_KEYS.map((key) => byKey.get(key) ?? pendingStep(key));
}

export function stepIsSettled(step: DeletionStep): boolean {
  return TERMINAL_STEP.has(step.status);
}

/** pending and failed are claimable; running only after the stale window. */
export function canClaimDeletionJob(
  status: DeletionJobStatus,
  updatedAt: Date,
  now: Date,
): boolean {
  if (status === 'pending' || status === 'failed') return true;
  return isStaleRunning(status, updatedAt, now);
}

/** failed always; running after 10 min; pending only after the orphan window. */
export function canRetryDeletionJob(
  status: DeletionJobStatus,
  updatedAt: Date,
  now: Date,
): boolean {
  if (status === 'failed') return true;
  if (status === 'pending') return isStalePending(updatedAt, now);
  return isStaleRunning(status, updatedAt, now);
}

export function completionStatus(
  steps: readonly DeletionStep[],
): 'completed' | 'completed_manual' {
  return steps.some((step) => step.status === 'manual')
    ? 'completed_manual'
    : 'completed';
}

export function clearsNotifyEmail(
  status: 'completed' | 'completed_manual' | 'failed',
): boolean {
  return status !== 'failed';
}

export function formatExpiry(iso: string | null): string {
  if (!iso) return 'fecha desconocida';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'fecha desconocida';
  return dayFormat.format(date);
}

export function renewalPaidNotRenewed(
  inspection: DomainInspection | null,
): boolean {
  const renewal = inspection?.renewal;
  if (!renewal || !isManagedRenewal(renewal)) return false;
  if (
    renewal.currentCycle?.status === 'paid' ||
    renewal.currentCycle?.status === 'renewal_failed'
  ) {
    return true;
  }
  return renewal.cycles.some(
    (cycle) => cycle.paidAt != null && cycle.renewedAt == null,
  );
}

export function deletionWarnings(input: {
  paidNotRenewed: boolean;
  balance: number;
  openInvoices: number;
  otherDnsProvider: string | null;
  autoRenewNeedsAttention: boolean;
  adminMember: boolean;
}): { warnings: string[]; blocking: boolean } {
  const warnings: string[] = [];
  if (input.paidNotRenewed) {
    warnings.push(
      'Hay un ciclo de renovación pagado que todavía no se renovó.',
    );
  }
  if (input.balance !== 0 || input.openInvoices > 0) {
    warnings.push('El cliente de Stripe tiene saldo o facturas abiertas.');
  }
  if (input.otherDnsProvider) {
    warnings.push(
      `La zona DNS está en ${input.otherDnsProvider}, no en el proveedor activo.`,
    );
  }
  if (input.autoRenewNeedsAttention) {
    warnings.push('La renovación automática no está apagada.');
  }
  if (input.adminMember) {
    warnings.push(
      'Es miembro del equipo de administración. Revócalo del equipo primero.',
    );
  }
  return { warnings, blocking: input.adminMember };
}

export function autoRenewNeedsAttention(input: {
  source: string | null;
  registrarDomainId: string | null;
  autoRenew: RegistrarAutoRenew | null;
}): boolean {
  if (input.source !== 'lattiz_managed' || !input.registrarDomainId) {
    return false;
  }
  return input.autoRenew !== 'off';
}

function isStalePending(updatedAt: Date, now: Date): boolean {
  return now.getTime() - updatedAt.getTime() >= DELETION_PENDING_STALE_MS;
}

function isStaleRunning(
  status: DeletionJobStatus,
  updatedAt: Date,
  now: Date,
): boolean {
  if (status !== 'running') return false;
  return now.getTime() - updatedAt.getTime() >= DELETION_CLAIM_STALE_MS;
}

function isManagedRenewal(
  renewal: DomainInspection['renewal'],
): renewal is ManagedRenewalInspection {
  return renewal != null && !('managedBy' in renewal);
}
