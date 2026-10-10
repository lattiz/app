import type {
  PlanChangeImpactItemDto,
  TemplateGalleryItemDto,
} from '@lattiz/api-client';
import { describe, expect, it } from 'vitest';
import {
  canConfirmDowngrade,
  filterByTier,
  isTemplateLocked,
  templateCardState,
  templateLoss,
} from './template-access';

function template(
  id: string,
  tier: 'basic' | 'pro',
  accessible: boolean,
): TemplateGalleryItemDto {
  return {
    id,
    name: id,
    description: null,
    category: 'barberias',
    previewUrl: `https://templates.lattiz.app/${id}`,
    thumbnailUrl: null,
    sortOrder: 0,
    tier,
    accessible,
    lockedReason: accessible ? null : 'REQUIRES_PRO',
  };
}

const ctx = {
  isCurrent: false,
  isSelecting: false,
  canPublish: true,
  siteLocked: false,
};

describe('gallery states per plan', () => {
  it('Básico tenant: Pro cards are locked with "Mejorar a Pro", Básico cards usable', () => {
    expect(templateCardState(template('oxido', 'pro', false), ctx)).toEqual({
      action: 'use',
      actionDisabled: true,
      showUpgrade: true,
      hint: 'locked',
    });
    expect(templateCardState(template('trazo', 'basic', true), ctx)).toEqual({
      action: 'use',
      actionDisabled: false,
      showUpgrade: false,
      hint: null,
    });
  });

  it('Pro tenant: every card is usable', () => {
    for (const t of [
      template('oxido', 'pro', true),
      template('trazo', 'basic', true),
    ]) {
      expect(templateCardState(t, ctx).actionDisabled).toBe(false);
      expect(templateCardState(t, ctx).showUpgrade).toBe(false);
    }
  });

  it('locked site (A2): the current Pro card cannot be edited and offers the upgrade; Básico cards stay usable', () => {
    const locked = { ...ctx, siteLocked: true };
    expect(
      templateCardState(template('oxido', 'pro', false), {
        ...locked,
        isCurrent: true,
      }),
    ).toEqual({
      action: 'edit',
      actionDisabled: true,
      showUpgrade: true,
      hint: 'current-locked',
    });
    expect(
      templateCardState(template('trazo', 'basic', true), locked)
        .actionDisabled,
    ).toBe(false);
  });

  it('a lapsed trial keeps switching disabled, as before', () => {
    expect(
      templateCardState(template('trazo', 'basic', true), {
        ...ctx,
        canPublish: false,
      }).actionDisabled,
    ).toBe(true);
  });

  it('filters by tier', () => {
    const all = [template('a', 'basic', true), template('b', 'pro', false)];
    expect(filterByTier(all, 'all').map((t) => t.id)).toEqual(['a', 'b']);
    expect(filterByTier(all, 'pro').map((t) => t.id)).toEqual(['b']);
    expect(filterByTier(all, 'basic').map((t) => t.id)).toEqual(['a']);
  });
});

describe('downgrade modal gating', () => {
  const loss: PlanChangeImpactItemDto = {
    kind: 'template_loss',
    templateId: 'barberia-oxido-v1',
    templateName: 'ÓXIDO Barber Club',
    effectiveAt: '2026-11-01T00:00:00.000Z',
  };

  it('finds the template loss in the impact', () => {
    expect(templateLoss([loss])).toEqual(loss);
    expect(templateLoss([])).toBeNull();
    expect(templateLoss(undefined)).toBeNull();
  });

  it('keeps confirm disabled until the loss is acknowledged', () => {
    const base = {
      impactReady: true,
      hasLoss: true,
      acknowledged: false,
      isPending: false,
    };
    expect(canConfirmDowngrade(base)).toBe(false);
    expect(canConfirmDowngrade({ ...base, acknowledged: true })).toBe(true);
  });

  it('allows confirm without a loss, but never before the impact is known or while sending', () => {
    expect(
      canConfirmDowngrade({
        impactReady: true,
        hasLoss: false,
        acknowledged: false,
        isPending: false,
      }),
    ).toBe(true);
    expect(
      canConfirmDowngrade({
        impactReady: false,
        hasLoss: false,
        acknowledged: false,
        isPending: false,
      }),
    ).toBe(false);
    expect(
      canConfirmDowngrade({
        impactReady: true,
        hasLoss: true,
        acknowledged: true,
        isPending: true,
      }),
    ).toBe(false);
  });
});

describe('locked banner', () => {
  it('shows only when the API says the template is locked', () => {
    expect(
      isTemplateLocked({ templateAccess: { current: null, locked: true } }),
    ).toBe(true);
    expect(
      isTemplateLocked({ templateAccess: { current: null, locked: false } }),
    ).toBe(false);
    expect(isTemplateLocked(undefined)).toBe(false);
  });
});
