import type {
  DeletionJobDto,
  DeletionPreviewDto,
  DeletionStepDto,
} from '@lattiz/api-client';
import { formatBytes, formatCount } from '@/lib/format';

export const DELETION_REASON_MIN = 3;
export const DELETION_REASON_MAX = 500;
export const DELETION_POLL_MS = 2_000;

export const STEP_ORDER = [
  'offline',
  'stripe',
  'domain',
  'registrar',
  'analytics',
  'storage',
  'emails',
  'account',
  'verify',
] as const satisfies readonly DeletionStepDto['key'][];

export const STEP_LABEL: Record<DeletionStepDto['key'], string> = {
  offline: 'Sitio fuera de línea',
  stripe: 'Stripe',
  domain: 'Dominio (Vercel y Cloudflare)',
  registrar: 'Registrador',
  analytics: 'Google Analytics',
  storage: 'Archivos',
  emails: 'Correos',
  account: 'Cuenta',
  verify: 'Verificación',
};

export const STEP_STATUS_LABEL: Record<DeletionStepDto['status'], string> = {
  pending: 'Pendiente',
  running: 'En curso',
  done: 'Hecho',
  skipped: 'Omitido',
  manual: 'Acción manual',
  failed: 'Falló',
};

/** Stable names so tests can check the icon without rendering. */
export const STEP_ICON: Record<
  DeletionStepDto['status'],
  'circle' | 'spinner' | 'check' | 'minus' | 'alert' | 'x'
> = {
  pending: 'circle',
  running: 'spinner',
  done: 'check',
  skipped: 'minus',
  manual: 'alert',
  failed: 'x',
};

export const JOB_STATUS_LABEL: Record<DeletionJobDto['status'], string> = {
  pending: 'En espera',
  running: 'En curso',
  completed: 'Completado',
  completed_manual: 'Con acciones manuales',
  failed: 'Falló',
};

export type StepView = {
  key: DeletionStepDto['key'];
  label: string;
  status: DeletionStepDto['status'];
  statusLabel: string;
  icon: (typeof STEP_ICON)[DeletionStepDto['status']];
  note: string | null;
  at: string | null;
};

export type ManualAction = {
  key: DeletionStepDto['key'];
  label: string;
  detail: string;
};

export type PreviewCard = {
  id: string;
  title: string;
  body: string;
};

const FINAL_STATUS = new Set<DeletionJobDto['status']>([
  'completed',
  'completed_manual',
  'failed',
]);

export function isFinalDeletionStatus(
  status: DeletionJobDto['status'],
): boolean {
  return FINAL_STATUS.has(status);
}

/** Poll while the job is still moving; stop on a final status or before the first payload. */
export function deletionRefetchInterval(
  status: DeletionJobDto['status'] | undefined,
): number | false {
  if (status === 'pending' || status === 'running') return DELETION_POLL_MS;
  return false;
}

export function canStartDeletion(input: {
  blocking: boolean;
  slug: string;
  confirmation: string;
  reason: string;
}): boolean {
  if (input.blocking) return false;
  if (input.slug.length === 0 || input.confirmation !== input.slug)
    return false;
  const reason = input.reason.trim();
  return (
    reason.length >= DELETION_REASON_MIN && reason.length <= DELETION_REASON_MAX
  );
}

export function isTeamDeletionWarning(warning: string): boolean {
  return /miembro del equipo/i.test(warning);
}

export function orderDeletionSteps(
  steps: readonly DeletionStepDto[],
): DeletionStepDto[] {
  const byKey = new Map(steps.map((step) => [step.key, step]));
  return STEP_ORDER.map((key) => byKey.get(key) ?? pendingStep(key));
}

export function describeStep(step: DeletionStepDto): StepView {
  return {
    key: step.key,
    label: STEP_LABEL[step.key],
    status: step.status,
    statusLabel: STEP_STATUS_LABEL[step.status],
    icon: STEP_ICON[step.status],
    note: step.status === 'failed' ? step.error : step.detail,
    at: step.finishedAt ?? step.startedAt,
  };
}

export function describeSteps(steps: readonly DeletionStepDto[]): StepView[] {
  return orderDeletionSteps(steps).map(describeStep);
}

export function manualActions(
  steps: readonly DeletionStepDto[],
): ManualAction[] {
  return orderDeletionSteps(steps)
    .filter((step) => step.status === 'manual')
    .map((step) => ({
      key: step.key,
      label: STEP_LABEL[step.key],
      detail: step.detail?.trim() || 'Revisa este paso a mano.',
    }));
}

export function manualActionsCopyText(
  actions: readonly ManualAction[],
  checked: ReadonlySet<string>,
): string {
  const lines = actions.map((action) => {
    const mark = checked.has(action.key) ? '[x]' : '[ ]';
    return `${mark} ${action.label}: ${action.detail}`;
  });
  return ['Acciones manuales pendientes', ...lines].join('\n');
}

export function deletionPreviewCards(
  preview: Pick<
    DeletionPreviewDto,
    'stripe' | 'domain' | 'analytics' | 'storage' | 'pendingEmails'
  >,
  formatWhen: (iso: string) => string,
): PreviewCard[] {
  const storage = storageFootprint(preview.storage);
  return [
    {
      id: 'stripe',
      title: 'Stripe',
      body: stripeDeletionLine(preview.stripe.liveSubscriptionIds.length),
    },
    {
      id: 'domain',
      title: 'Dominio',
      body: domainDeletionLine(preview.domain, formatWhen),
    },
    {
      id: 'analytics',
      title: 'Google Analytics',
      body: analyticsDeletionLine(preview.analytics),
    },
    {
      id: 'files',
      title: 'Archivos (R2)',
      body: filesDeletionLine(storage.bytes, storage.files),
    },
    {
      id: 'emails',
      title: 'Correos',
      body: emailsDeletionLine(preview.pendingEmails),
    },
    {
      id: 'account',
      title: 'Cuenta',
      body: 'Se borra el usuario y los datos del sitio.',
    },
  ];
}

export function storageFootprint(storage: DeletionPreviewDto['storage']): {
  bytes: number;
  files: number;
} {
  return {
    bytes: storage.assetsBytes + storage.brandingBytes,
    files: storage.assetsObjects + storage.brandingObjects,
  };
}

function stripeDeletionLine(count: number): string {
  const kept = 'El cliente y sus facturas se conservan.';
  if (count === 1) return `Se cancela 1 suscripción. ${kept}`;
  return `Se cancelan ${formatCount(count)} suscripciones. ${kept}`;
}

function domainDeletionLine(
  domain: DeletionPreviewDto['domain'],
  formatWhen: (iso: string) => string,
): string {
  if (!domain) return 'No hay dominio que liberar.';
  const when = domain.expiresAt
    ? formatWhen(domain.expiresAt)
    : 'una fecha desconocida';
  return `Vercel y Cloudflare se liberan. En Openprovider se deja expirar el ${when}.`;
}

function analyticsDeletionLine(
  analytics: DeletionPreviewDto['analytics'],
): string {
  if (analytics.isMock) {
    return 'Es una propiedad de prueba. No hay una cuenta real de Google que mover a la papelera.';
  }
  if (!analytics.propertyId) return 'No hay propiedad de Google Analytics.';
  return 'La propiedad va a la papelera y se elimina en 35 días.';
}

function filesDeletionLine(bytes: number, files: number): string {
  const noun = files === 1 ? 'archivo' : 'archivos';
  return `${formatBytes(bytes)} en ${formatCount(files)} ${noun}.`;
}

function emailsDeletionLine(count: number): string {
  if (count === 1) return '1 pendiente se cancela.';
  return `${formatCount(count)} pendientes se cancelan.`;
}

function pendingStep(key: DeletionStepDto['key']): DeletionStepDto {
  return {
    key,
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    detail: null,
    error: null,
  };
}
