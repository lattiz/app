import type { PreviewPolicyConfig } from '../../../common/billing/preview-capability';
import {
  classifyTrial,
  hoursToConvert,
  type TrialSummarySample,
} from './admin-trials.classify';
import type { AdminTrialListItemDto } from './admin-trials.dto';

export interface TrialRow {
  tenant_id: string;
  slug: string;
  name: string;
  email: string | null;
  plan: string;
  entitled: boolean | string | null;
  preview_started_at: string | Date;
  template_id: string | null;
  template_name: string | null;
  converted_at: string | Date | null;
}

export function mapTrialItem(
  row: TrialRow,
  policy: PreviewPolicyConfig,
  now: Date,
): AdminTrialListItemDto {
  const entitled = toBool(row.entitled);
  const classified = classifyTrial(
    {
      isEntitled: entitled,
      plan: row.plan,
      previewStartedAt: row.preview_started_at,
      convertedAt: row.converted_at,
    },
    policy,
    now,
  );
  return {
    tenant: {
      id: row.tenant_id,
      slug: row.slug,
      name: row.name,
      email: row.email,
    },
    template: row.template_id
      ? { id: row.template_id, name: row.template_name }
      : null,
    previewStartedAt: toIsoRequired(row.preview_started_at),
    previewExpiresAt: toIso(classified.previewExpiresAt),
    state: classified.state,
    convertedAt: toIso(row.converted_at),
    hoursToConvert: hoursToConvert(row.preview_started_at, row.converted_at),
  };
}

export function trialSample(
  row: TrialRow,
  policy: PreviewPolicyConfig,
  now: Date,
): TrialSummarySample {
  const item = mapTrialItem(row, policy, now);
  return {
    startedAt: new Date(item.previewStartedAt),
    state: item.state,
    hoursToConvert: item.hoursToConvert,
  };
}

function toBool(value: boolean | string | null | undefined): boolean {
  return value === true || value === 'true' || value === 't';
}

function toIso(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toIsoRequired(value: string | Date): string {
  const iso = toIso(value);
  if (!iso) throw new Error('Expected a timestamp');
  return iso;
}
