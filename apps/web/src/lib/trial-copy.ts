import { formatDate } from '@/lib/format';
import type { PreviewState } from '@/types/dashboard.types';

const DAY_MS = 86_400_000;
/** Presentational warning only. Trial length is whatever `previewExpiresAt` says. */
const ENDING_SOON_DAYS = 3;

export const trialCta = {
  seePlans: 'Ver planes',
  choosePlan: 'Elige un plan',
} as const;

export const trialBadgeLabel = {
  active: 'Prueba gratuita',
  ended: 'Prueba terminada',
} as const;

export const upgradeGateCopy = {
  title: 'Disponible con un plan',
  domain:
    'El dominio propio forma parte del plan. Tu diseño se conserva.',
  address: 'La dirección personalizada forma parte del plan.',
  analytics: 'Las visitas de tu sitio forman parte del plan.',
  cta: trialCta.seePlans,
} as const;

export const lapsedGateCopy = {
  title: 'Elige un plan para continuar',
  body: 'Tu diseño se conserva. Con un plan vuelves a publicar, conectas tu dominio y ves las visitas de tu sitio.',
  cta: trialCta.seePlans,
} as const;

export const onboardingStepCopy = {
  template: 'Elige tu plantilla',
  address: 'Elige la dirección de tu sitio',
  edit: 'Edita tu sitio',
  seo: 'Configura el SEO y la marca',
  publish: 'Publica y ve tu sitio',
  domain: 'Conecta tu dominio',
} as const;

export const onboardingTourCopy = {
  welcome:
    'Bienvenido a Lattiz. Elige una plantilla, edita y publica para ver tu sitio. El dominio propio llega con un plan.',
  template: 'Elige la plantilla base para tu negocio.',
  address: 'Elige la dirección personalizada de tu sitio.',
  edit: 'Edita tu sitio y publícalo para verlo en línea. La prueba empieza con esa primera publicación.',
  seo: 'Configura el título, descripción y favicon de tu sitio.',
  domain:
    'Con un plan, conecta tu dominio aquí. Tu diseño actual se conserva.',
} as const;

const PLAN_KEEPS_DESIGN =
  'Al elegir un plan, tu diseño actual se conserva y podrás conectar tu dominio.';

export type TrialBannerTone = 'info' | 'warning' | 'destructive';

export interface TrialBannerCopy {
  tone: TrialBannerTone;
  title: string;
  description: string;
  cta: (typeof trialCta)[keyof typeof trialCta] | null;
}

/** Whole days from now until `iso`. Null when the timestamp cannot be read. */
export function daysUntilPreviewEnd(
  iso: string,
  now = Date.now(),
): number | null {
  const end = new Date(iso).getTime();
  if (!Number.isFinite(end)) return null;
  const diff = end - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / DAY_MS);
}

function remainingLabel(days: number): string {
  return days === 1 ? '1 día restante' : `${days} días restantes`;
}

function activeDescription(
  previewExpiresAt: string | null | undefined,
  now: number,
): { description: string; tone: TrialBannerTone } {
  if (!previewExpiresAt) {
    return {
      tone: 'info',
      description: 'Tu sitio de prueba está en línea.',
    };
  }
  const days = daysUntilPreviewEnd(previewExpiresAt, now);
  if (days == null) {
    return {
      tone: 'info',
      description: 'Tu sitio de prueba está en línea.',
    };
  }
  return {
    tone: days <= ENDING_SOON_DAYS ? 'warning' : 'info',
    description: `Tu sitio de prueba está en línea hasta el ${formatDate(previewExpiresAt)} (${remainingLabel(days)}).`,
  };
}

/** Home banner for a free preview. Paid and lapsed return null. */
export function trialHomeBanner(
  previewState: PreviewState | null | undefined,
  previewExpiresAt: string | null | undefined,
  now = Date.now(),
): TrialBannerCopy | null {
  if (previewState === 'trial_unstarted') {
    return {
      tone: 'info',
      title: 'Prueba gratuita',
      description: 'Tu prueba gratuita empieza cuando publiques tu sitio.',
      cta: null,
    };
  }
  if (previewState === 'trial_active') {
    const active = activeDescription(previewExpiresAt, now);
    return {
      tone: active.tone,
      title: 'Prueba gratuita',
      description: active.description,
      cta: trialCta.seePlans,
    };
  }
  if (previewState === 'trial_expired') {
    return {
      tone: 'destructive',
      title: 'Prueba terminada',
      description:
        'Tu prueba terminó. Tu sitio dejó de mostrarse, pero tu diseño se conserva. Elige un plan para volver a publicar y conectar tu dominio.',
      cta: trialCta.choosePlan,
    };
  }
  return null;
}

/** Short note above the plan picker while a free preview is in play. */
export function trialSubscriptionNote(
  previewState: PreviewState | null | undefined,
  previewExpiresAt: string | null | undefined,
  now = Date.now(),
): string | null {
  if (previewState === 'trial_expired') {
    return 'Tu prueba terminó. Tu diseño actual se conserva: al elegir un plan podrás volver a publicar y conectar tu dominio.';
  }
  if (previewState === 'trial_unstarted') {
    return `Tu prueba gratuita empieza cuando publiques tu sitio. ${PLAN_KEEPS_DESIGN}`;
  }
  if (previewState === 'trial_active') {
    return `${activeDescription(previewExpiresAt, now).description} ${PLAN_KEEPS_DESIGN}`;
  }
  return null;
}
