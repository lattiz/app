import type { PlanChangeOptionDto } from '@lattiz/api-client';

type Blocker = PlanChangeOptionDto['blockers'][number];

export const SUPPORT_EMAIL = 'soporte@lattiz.mx';

/** What a tenant actually loses on Básico, as the API gates it today. */
export const PRO_ONLY_FEATURES = [
  'Analíticas de tu sitio (Google Analytics): dejaremos de medir visitas, pero tus datos se conservan',
  'Dominios cuya renovación solo cubre Pro',
];

export const planChangeCopy = {
  sectionTitle: 'Cambiar de plan',
  upgradeCta: 'Mejorar a Pro',
  downgradeCta: 'Cambiar a Básico',
  upgradeTitle: 'Mejorar a Pro',
  upgradeBody:
    'Se aplica de inmediato. Stripe te mostrará el cargo prorrateado antes de confirmar.',
  upgradeConfirm: 'Continuar a Stripe',
  downgradeTitle: 'Cambiar a Básico',
  downgradeBody: (date: string) =>
    `Seguirás con Pro hasta el ${date}. Después pasarás a Básico.`,
  downgradeLosesTitle: 'Con Básico dejarás de tener:',
  downgradeConfirm: 'Programar cambio',
  cancel: 'Cancelar',
  pendingTitle: (plan: string, date: string) =>
    `Cambio programado: pasarás a ${plan} el ${date}`,
  pendingNote:
    'Mientras haya un cambio programado no podrás cancelar la suscripción desde el portal; cancela el cambio primero.',
  pendingCancel: 'Cancelar cambio',
  scheduledToast: (date: string) =>
    `Listo. Pasarás a Básico el ${date}; hasta entonces sigues con Pro.`,
  releasedToast: 'Cancelaste el cambio de plan. Sigues con tu plan actual.',
  doneToast: '¡Listo! Ya tienes el plan Pro.',
  processingToast:
    'Estamos procesando tu cambio de plan. Se reflejará en unos minutos.',
  canceledToast: 'No se hizo ningún cambio en tu plan.',
  genericError: 'No se pudo cambiar el plan. Intenta de nuevo en unos minutos.',
  releaseError:
    'No se pudo cancelar el cambio. Intenta de nuevo en unos minutos.',
  contactSupport: 'Contactar a soporte',
} as const;

const BLOCKER_MESSAGES: Record<Blocker, string> = {
  NO_ACTIVE_SUBSCRIPTION:
    'Necesitas una suscripción activa para cambiar de plan.',
  SUBSCRIPTION_NOT_ACTIVE: 'Regulariza tu pago antes de cambiar de plan.',
  SUBSCRIPTION_CANCELING:
    'Tu suscripción está programada para cancelarse. Reactívala para cambiar de plan.',
  SAME_PLAN: 'Ya estás en este plan.',
  PLAN_CHANGE_PENDING: 'Ya tienes un cambio de plan programado.',
  UNSUPPORTED_SUBSCRIPTION:
    'Tu suscripción no se puede cambiar desde aquí. Escríbenos y lo resolvemos.',
  DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP:
    'La renovación de tu dominio no está incluida en Básico, así que por ahora no puedes cambiar a ese plan.',
  DOWNGRADE_PRICE_UNAVAILABLE:
    'No pudimos confirmar el costo de renovación de tu dominio. Intenta de nuevo más tarde.',
};

/** SAME_PLAN is implied by the UI (the option is hidden), so it is never shown. */
export function blockerMessages(blockers: Blocker[]): string[] {
  return blockers
    .filter((code) => code !== 'SAME_PLAN')
    .map((code) => BLOCKER_MESSAGES[code]);
}

export function needsSupport(blockers: Blocker[]): boolean {
  return blockers.some(
    (code) =>
      code === 'DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP' ||
      code === 'UNSUPPORTED_SUBSCRIPTION',
  );
}

/** The API answers `{ error: { code, details } }`; only the codes we can explain get specific copy. */
export function planChangeErrorMessage(err: unknown): string {
  const error = (
    err as {
      error?: { code?: string; details?: { blockers?: Blocker[] } };
    } | null
  )?.error;
  if (error?.code === 'PLAN_CHANGE_NOT_ALLOWED') {
    const [first] = blockerMessages(error.details?.blockers ?? []);
    if (first) return first;
  }
  return planChangeCopy.genericError;
}
