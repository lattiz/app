import { describe, expect, it } from 'vitest';
import {
  immediateCancelConfirmed,
  SCHEDULE_ACTIVE_MESSAGE,
  STRIPE_UNAVAILABLE_MESSAGE,
  subscriptionActionSet,
  subscriptionErrorKind,
  subscriptionErrorText,
} from './actions';

const open = {
  status: 'active',
  cancelAt: null,
  cancelAtPeriodEnd: false,
};

describe('subscription actions', () => {
  it('shows cancel and resume only to the owner', () => {
    expect(subscriptionActionSet('owner', open)).toEqual({
      cancel: true,
      resume: false,
    });
    expect(
      subscriptionActionSet('owner', {
        status: 'active',
        cancelAt: '2026-11-01T00:00:00.000Z',
        cancelAtPeriodEnd: true,
      }),
    ).toEqual({ cancel: true, resume: true });
    expect(
      subscriptionActionSet('owner', { ...open, status: 'canceled' }),
    ).toEqual({
      cancel: false,
      resume: false,
    });
    expect(subscriptionActionSet('operator', open)).toEqual({
      cancel: false,
      resume: false,
    });
    expect(
      subscriptionActionSet('viewer', { ...open, cancelAtPeriodEnd: true }),
    ).toEqual({
      cancel: false,
      resume: false,
    });
  });

  it('asks for the exact client identifier before canceling now', () => {
    expect(immediateCancelConfirmed(' taqueria ', 'taqueria')).toBe(true);
    expect(immediateCancelConfirmed('Taqueria', 'taqueria')).toBe(false);
  });

  it('maps schedule and Stripe failures to plain sentences', () => {
    const schedule = {
      error: { code: 'SUBSCRIPTION_SCHEDULE_ACTIVE', message: 'schedule' },
    };
    const stripe = {
      error: { code: 'ADMIN_STRIPE_UNAVAILABLE', message: 'stripe' },
    };
    const ended = {
      error: {
        code: 'SUBSCRIPTION_NOT_CANCELABLE',
        message: 'La suscripción ya terminó.',
      },
    };
    expect(subscriptionErrorKind(schedule)).toBe('schedule');
    expect(subscriptionErrorText(schedule)).toBe(SCHEDULE_ACTIVE_MESSAGE);
    expect(subscriptionErrorKind(stripe)).toBe('stripe');
    expect(subscriptionErrorText(stripe)).toBe(STRIPE_UNAVAILABLE_MESSAGE);
    expect(subscriptionErrorText(ended)).toBe('La suscripción ya terminó.');
  });
});
