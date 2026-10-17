import { describe, expect, it } from 'vitest';
import { describeAction } from './actions';

describe('describeAction', () => {
  it('translates known actions', () => {
    expect(describeAction('template.retire')).toEqual({
      label: 'Retiró una plantilla',
      failed: false,
    });
    expect(describeAction('subscription.cancel')).toEqual({
      label: 'Canceló una suscripción',
      failed: false,
    });
  });

  it('keeps the translation and flags a failed attempt', () => {
    expect(describeAction('subscription.cancel.failed')).toEqual({
      label: 'Canceló una suscripción',
      failed: true,
    });
  });

  it('shows an unknown action as it arrived', () => {
    expect(describeAction('billing.refund')).toEqual({
      label: 'billing.refund',
      failed: false,
    });
    expect(describeAction('billing.refund.failed')).toEqual({
      label: 'billing.refund.failed',
      failed: true,
    });
  });
});
