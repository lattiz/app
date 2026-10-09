/** Postgres `timestamptz + interval '1 day'` is 24 hours, and the window is exclusive at the end. */
const DAY_MS = 86_400_000;

export const PREVIEW_STATES = [
  'paid',
  'trial_unstarted',
  'trial_active',
  'trial_expired',
  'lapsed',
] as const;

export type PreviewState = (typeof PREVIEW_STATES)[number];

export interface PreviewCapabilityInput {
  isEntitled: boolean;
  plan: string;
  previewStartedAt: Date | string | null;
}

/** Thresholds only. Callers pass {@link PreviewConfig}; this function never reads the environment. */
export interface PreviewPolicyConfig {
  enabled: boolean;
  trialDays: number;
}

export interface PreviewCapability {
  state: PreviewState;
  canPublish: boolean;
  previewExpiresAt: Date | null;
}

/**
 * Single rule for publish, asset upload, and template changes.
 * Entitled tenants are `paid`. Plan `none` gets the free window. Everyone else
 * who is not entitled is `lapsed` (including a legacy `trial` plan). When
 * `enabled` is false the window does not grant access.
 */
export function computePreviewCapability(
  input: PreviewCapabilityInput,
  config: PreviewPolicyConfig,
  now: Date = new Date(),
): PreviewCapability {
  if (input.isEntitled) {
    return { state: 'paid', canPublish: true, previewExpiresAt: null };
  }

  if (input.plan !== 'none') {
    return { state: 'lapsed', canPublish: false, previewExpiresAt: null };
  }

  const startedAt = startedAtOf(input.previewStartedAt);
  if (startedAt === 'missing') {
    return {
      state: 'trial_unstarted',
      canPublish: config.enabled,
      previewExpiresAt: null,
    };
  }
  if (startedAt === 'invalid') {
    return {
      state: 'trial_expired',
      canPublish: false,
      previewExpiresAt: null,
    };
  }

  const previewExpiresAt = new Date(
    startedAt.getTime() + config.trialDays * DAY_MS,
  );
  const active = now.getTime() < previewExpiresAt.getTime();
  return {
    state: active ? 'trial_active' : 'trial_expired',
    canPublish: config.enabled && active,
    previewExpiresAt,
  };
}

function startedAtOf(
  value: Date | string | null,
): Date | 'missing' | 'invalid' {
  if (value == null) return 'missing';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'invalid' : date;
}
