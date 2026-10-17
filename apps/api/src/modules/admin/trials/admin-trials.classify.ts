import {
  computePreviewCapability,
  type PreviewPolicyConfig,
} from '../../../common/billing/preview-capability';

export const ADMIN_TRIAL_STATES = [
  'active',
  'expiring',
  'expired',
  'converted',
] as const;

export type AdminTrialState = (typeof ADMIN_TRIAL_STATES)[number];

/** Open window with less than this left is `expiring`. Matches the SQL filter. */
export const EXPIRING_WITHIN_HOURS = 48;

const HOUR_MS = 3_600_000;
/** Same 24h day `computePreviewCapability` uses for `interval '1 day'`. */
const DAY_MS = 86_400_000;

export interface TrialClassificationInput {
  isEntitled: boolean;
  plan: string;
  previewStartedAt: Date | string;
  /** First subscription created after `preview_started_at`. */
  convertedAt: Date | string | null;
}

export interface TrialClassification {
  state: AdminTrialState;
  previewExpiresAt: Date | null;
}

/**
 * Converted wins even while the window is open. Otherwise the state follows
 * `computePreviewCapability`: an open `trial_active` window is `expiring`
 * under 48h and `active` otherwise. Anything else (closed, lapsed, paid
 * without a later subscription) is `expired`.
 */
export function classifyTrial(
  input: TrialClassificationInput,
  config: PreviewPolicyConfig,
  now: Date,
): TrialClassification {
  const capability = computePreviewCapability(
    {
      isEntitled: input.isEntitled,
      plan: input.plan,
      previewStartedAt: input.previewStartedAt,
    },
    config,
    now,
  );

  if (input.convertedAt != null) {
    return {
      state: 'converted',
      previewExpiresAt: capability.previewExpiresAt,
    };
  }

  if (capability.state === 'trial_active' && capability.previewExpiresAt) {
    const remaining = capability.previewExpiresAt.getTime() - now.getTime();
    return {
      state:
        remaining < EXPIRING_WITHIN_HOURS * HOUR_MS ? 'expiring' : 'active',
      previewExpiresAt: capability.previewExpiresAt,
    };
  }

  return {
    state: 'expired',
    previewExpiresAt: capability.previewExpiresAt,
  };
}

export function hoursToConvert(
  previewStartedAt: Date | string,
  convertedAt: Date | string | null,
): number | null {
  if (convertedAt == null) return null;
  const start = new Date(previewStartedAt).getTime();
  const end =
    convertedAt instanceof Date
      ? convertedAt.getTime()
      : new Date(convertedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return (end - start) / HOUR_MS;
}

/** Null when no trial started in the window, so the UI does not show 0%. */
export function conversionRate(
  started: number,
  converted: number,
): number | null {
  if (!Number.isInteger(started) || started <= 0) return null;
  if (!Number.isInteger(converted) || converted < 0) return null;
  return converted / started;
}

export function medianHours(values: readonly number[]): number | null {
  const sorted = values
    .filter((value) => Number.isFinite(value))
    .toSorted((left, right) => left - right);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? null;
  const left = sorted[mid - 1];
  const right = sorted[mid];
  if (left === undefined || right === undefined) return null;
  return (left + right) / 2;
}

export interface TrialSummarySample {
  startedAt: Date;
  state: AdminTrialState;
  hoursToConvert: number | null;
}

export interface TrialSummaryFigures {
  active: number;
  expiring: number;
  expired: number;
  converted: number;
  conversionRate30d: number | null;
  conversionRate90d: number | null;
  medianHoursToConvert: number | null;
}

export function summarizeTrials(
  samples: readonly TrialSummarySample[],
  now: Date,
): TrialSummaryFigures {
  const counts: Record<AdminTrialState, number> = {
    active: 0,
    expiring: 0,
    expired: 0,
    converted: 0,
  };
  const hours: number[] = [];
  let started30 = 0;
  let converted30 = 0;
  let started90 = 0;
  let converted90 = 0;
  const nowMs = now.getTime();

  for (const sample of samples) {
    counts[sample.state] += 1;
    if (sample.state === 'converted' && sample.hoursToConvert != null) {
      hours.push(sample.hoursToConvert);
    }
    const age = nowMs - sample.startedAt.getTime();
    if (!Number.isFinite(age) || age < 0) continue;
    if (age <= 30 * DAY_MS) {
      started30 += 1;
      if (sample.state === 'converted') converted30 += 1;
    }
    if (age <= 90 * DAY_MS) {
      started90 += 1;
      if (sample.state === 'converted') converted90 += 1;
    }
  }

  return {
    active: counts.active,
    expiring: counts.expiring,
    expired: counts.expired,
    converted: counts.converted,
    conversionRate30d: conversionRate(started30, converted30),
    conversionRate90d: conversionRate(started90, converted90),
    medianHoursToConvert: medianHours(hours),
  };
}
