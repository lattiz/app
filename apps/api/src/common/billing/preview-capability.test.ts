import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  computePreviewCapability,
  type PreviewPolicyConfig,
} from './preview-capability';

const DAY_MS = 86_400_000;
const enabled: PreviewPolicyConfig = { enabled: true, trialDays: 14 };
const disabled: PreviewPolicyConfig = { enabled: false, trialDays: 14 };
const now = new Date('2026-06-15T12:00:00.000Z');

function stamp(daysBeforeNow: number): Date {
  return new Date(now.getTime() - daysBeforeNow * DAY_MS);
}

describe('computePreviewCapability', () => {
  it('treats an entitled tenant as paid', () => {
    const result = computePreviewCapability(
      { isEntitled: true, plan: 'basico', previewStartedAt: stamp(20) },
      enabled,
      now,
    );
    assert.deepEqual(result, {
      state: 'paid',
      canPublish: true,
      previewExpiresAt: null,
    });
  });

  it('lets a never-paid tenant publish before the clock is stamped', () => {
    const result = computePreviewCapability(
      { isEntitled: false, plan: 'none', previewStartedAt: null },
      enabled,
      now,
    );
    assert.deepEqual(result, {
      state: 'trial_unstarted',
      canPublish: true,
      previewExpiresAt: null,
    });
  });

  it('keeps the window open strictly before the stamp plus trial days', () => {
    const startedAt = stamp(13);
    const result = computePreviewCapability(
      { isEntitled: false, plan: 'none', previewStartedAt: startedAt },
      enabled,
      now,
    );
    assert.equal(result.state, 'trial_active');
    assert.equal(result.canPublish, true);
    assert.equal(
      result.previewExpiresAt?.toISOString(),
      new Date(startedAt.getTime() + 14 * DAY_MS).toISOString(),
    );
  });

  it('closes the window at the exact end instant', () => {
    const startedAt = stamp(14);
    const result = computePreviewCapability(
      {
        isEntitled: false,
        plan: 'none',
        previewStartedAt: startedAt.toISOString(),
      },
      enabled,
      now,
    );
    assert.equal(result.state, 'trial_expired');
    assert.equal(result.canPublish, false);
    assert.equal(result.previewExpiresAt?.getTime(), now.getTime());
  });

  it('blocks a never-paid tenant after the window', () => {
    const startedAt = stamp(15);
    const result = computePreviewCapability(
      { isEntitled: false, plan: 'none', previewStartedAt: startedAt },
      enabled,
      now,
    );
    assert.equal(result.state, 'trial_expired');
    assert.equal(result.canPublish, false);
    assert.equal(
      result.previewExpiresAt?.toISOString(),
      new Date(startedAt.getTime() + 14 * DAY_MS).toISOString(),
    );
  });

  it('does not give a lapsed basico or pro plan a free window', () => {
    for (const plan of ['basico', 'pro']) {
      const result = computePreviewCapability(
        { isEntitled: false, plan, previewStartedAt: null },
        enabled,
        now,
      );
      assert.deepEqual(result, {
        state: 'lapsed',
        canPublish: false,
        previewExpiresAt: null,
      });
    }
  });

  it('treats a legacy trial plan as lapsed', () => {
    const result = computePreviewCapability(
      { isEntitled: false, plan: 'trial', previewStartedAt: stamp(1) },
      enabled,
      now,
    );
    assert.deepEqual(result, {
      state: 'lapsed',
      canPublish: false,
      previewExpiresAt: null,
    });
  });

  it('removes the window when the preview is switched off', () => {
    const unstarted = computePreviewCapability(
      { isEntitled: false, plan: 'none', previewStartedAt: null },
      disabled,
      now,
    );
    assert.deepEqual(unstarted, {
      state: 'trial_unstarted',
      canPublish: false,
      previewExpiresAt: null,
    });

    const active = computePreviewCapability(
      { isEntitled: false, plan: 'none', previewStartedAt: stamp(1) },
      disabled,
      now,
    );
    assert.equal(active.state, 'trial_active');
    assert.equal(active.canPublish, false);
    assert.ok(active.previewExpiresAt);

    const paid = computePreviewCapability(
      { isEntitled: true, plan: 'pro', previewStartedAt: null },
      disabled,
      now,
    );
    assert.deepEqual(paid, {
      state: 'paid',
      canPublish: true,
      previewExpiresAt: null,
    });
  });
});
