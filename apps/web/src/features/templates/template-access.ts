import type {
  PlanChangeImpactItemDto,
  TemplateGalleryItemDto,
  TenantMeResponseDto,
} from '@lattiz/api-client';

/**
 * Template access as the dashboard shows it. The API decides (`accessible`,
 * `templateAccess.locked`); these helpers only turn its answer into UI state.
 */

export type TierFilter = 'all' | 'basic' | 'pro';

export function filterByTier(
  templates: readonly TemplateGalleryItemDto[],
  filter: TierFilter,
): TemplateGalleryItemDto[] {
  return filter === 'all'
    ? [...templates]
    : templates.filter((template) => template.tier === filter);
}

export interface TemplateCardState {
  /** The primary button: edit the current site, or use this template. */
  action: 'edit' | 'use';
  actionDisabled: boolean;
  /** Plan doesn't include it (gallery) or no longer includes it (current, A2): show "Mejorar a Pro". */
  showUpgrade: boolean;
  hint: 'locked' | 'current-locked' | null;
}

export function templateCardState(
  template: Pick<TemplateGalleryItemDto, 'accessible'>,
  ctx: {
    isCurrent: boolean;
    isSelecting: boolean;
    /** Free preview ended / no plan: keep the current template, block a switch. */
    canPublish: boolean;
    /** The site's current template is above the plan (GET /tenants/me). */
    siteLocked: boolean;
  },
): TemplateCardState {
  if (ctx.isCurrent) {
    return {
      action: 'edit',
      actionDisabled: ctx.isSelecting || ctx.siteLocked,
      showUpgrade: ctx.siteLocked,
      hint: ctx.siteLocked ? 'current-locked' : null,
    };
  }
  if (!template.accessible) {
    return {
      action: 'use',
      actionDisabled: true,
      showUpgrade: true,
      hint: 'locked',
    };
  }
  return {
    action: 'use',
    actionDisabled: ctx.isSelecting || !ctx.canPublish,
    showUpgrade: false,
    hint: null,
  };
}

export function isTemplateLocked(
  tenant: Pick<TenantMeResponseDto, 'templateAccess'> | null | undefined,
): boolean {
  return tenant?.templateAccess?.locked === true;
}

/** The `template_loss` item of a plan-change impact, if any. */
export function templateLoss(
  items: readonly PlanChangeImpactItemDto[] | undefined,
): PlanChangeImpactItemDto | null {
  return items?.find((item) => item.kind === 'template_loss') ?? null;
}

/** A downgrade that loses the template can only be confirmed once acknowledged. */
export function canConfirmDowngrade(state: {
  impactReady: boolean;
  hasLoss: boolean;
  acknowledged: boolean;
  isPending: boolean;
}): boolean {
  if (state.isPending || !state.impactReady) return false;
  return !state.hasLoss || state.acknowledged;
}
