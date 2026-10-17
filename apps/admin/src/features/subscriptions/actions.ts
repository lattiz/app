import { readApiErrorBody } from '@/lib/admin-errors';
import type { AdminRole } from '@/lib/navigation';

const TERMINAL = new Set(['canceled', 'incomplete_expired']);

export type SubscriptionActionInput = {
  status: string;
  cancelAt: string | null;
  cancelAtPeriodEnd: boolean;
};

export type SubscriptionActionSet = {
  cancel: boolean;
  resume: boolean;
};

export function subscriptionActionSet(
  role: AdminRole,
  subscription: SubscriptionActionInput,
): SubscriptionActionSet {
  if (role !== 'owner') return { cancel: false, resume: false };
  const terminal = TERMINAL.has(subscription.status);
  const scheduled =
    subscription.cancelAt != null || subscription.cancelAtPeriodEnd;
  return {
    cancel: !terminal,
    resume: !terminal && scheduled,
  };
}

export function immediateCancelConfirmed(typed: string, slug: string): boolean {
  return typed.trim() === slug;
}

export type SubscriptionErrorKind = 'schedule' | 'stripe' | 'message';

export const SCHEDULE_ACTIVE_MESSAGE =
  'Hay un cambio de plan programado. Gestiónalo en Stripe.';

export const STRIPE_UNAVAILABLE_MESSAGE =
  'No se pudo hablar con Stripe; no se cambió nada.';

export function subscriptionErrorKind(error: unknown): SubscriptionErrorKind {
  const code = readApiErrorBody(error).code;
  if (code === 'SUBSCRIPTION_SCHEDULE_ACTIVE') return 'schedule';
  if (code === 'ADMIN_STRIPE_UNAVAILABLE') return 'stripe';
  return 'message';
}

export function subscriptionErrorText(error: unknown): string {
  const kind = subscriptionErrorKind(error);
  if (kind === 'schedule') return SCHEDULE_ACTIVE_MESSAGE;
  if (kind === 'stripe') return STRIPE_UNAVAILABLE_MESSAGE;
  return readApiErrorBody(error).message ?? 'No se pudo completar la acción.';
}
