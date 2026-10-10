import type { BillingPlan } from './billing.constants';
import { evaluateTemplateAccess } from '../templates/template-access.policy';
import type { CurrentTemplate } from '../templates/template-access.service';

/**
 * What a tenant loses by moving to another plan, shown before they confirm.
 * Only `template_loss` is computed today. `analytics` (GA4 is Pro-only) and
 * `domain_renewal_cap` are reserved kinds so the contract can grow without a
 * breaking change; a Pro tenant whose managed domain renews above the Básico
 * cap is already refused the downgrade (DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP).
 */
export const PLAN_CHANGE_IMPACT_KINDS = [
  'template_loss',
  'analytics',
  'domain_renewal_cap',
] as const;
export type PlanChangeImpactKind = (typeof PLAN_CHANGE_IMPACT_KINDS)[number];

export interface TemplateLossImpact {
  kind: 'template_loss';
  templateId: string;
  templateName: string | null;
  /** ISO date the tenant stops having access; null when unknown (no subscription). */
  effectiveAt: string | null;
}

export type PlanChangeImpactItem = TemplateLossImpact;

/** `template_loss` when the target plan does not include the site's current template. */
export function templateLossImpact(
  current: CurrentTemplate | null,
  targetPlan: BillingPlan,
  effectiveAt: string | null,
): TemplateLossImpact | null {
  if (!current || evaluateTemplateAccess(targetPlan, current.tier).allowed)
    return null;
  return {
    kind: 'template_loss',
    templateId: current.id,
    templateName: current.name,
    effectiveAt,
  };
}
