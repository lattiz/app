import { computeIsEntitled } from '../../../common/billing/entitlement';
import type { PreviewPolicyConfig } from '../../../common/billing/preview-capability';
import { classifyTrial } from '../trials/admin-trials.classify';

export interface TrialFact {
  plan: string;
  previewStartedAt: string | Date;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | Date | null;
  convertedAt: string | Date | null;
}

export interface TrialCounts {
  active: number;
  expiringWithin48h: number;
}

/** Same 48h split as the trials list: `classifyTrial` over the live preview rule. */
export function countOpenTrials(
  rows: readonly TrialFact[],
  config: PreviewPolicyConfig,
  now: Date,
): TrialCounts {
  let active = 0;
  let expiringWithin48h = 0;
  for (const row of rows) {
    const state = classifyTrial(
      {
        isEntitled: computeIsEntitled(
          row.subscriptionStatus
            ? {
                status: row.subscriptionStatus,
                currentPeriodEnd: row.currentPeriodEnd,
              }
            : null,
        ),
        plan: row.plan,
        previewStartedAt: row.previewStartedAt,
        convertedAt: row.convertedAt,
      },
      config,
      now,
    ).state;
    if (state === 'active') active += 1;
    if (state === 'expiring') expiringWithin48h += 1;
  }
  return { active, expiringWithin48h };
}
