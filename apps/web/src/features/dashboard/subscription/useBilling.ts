import { useMutation, useQuery } from '@tanstack/react-query';
import {
  billingControllerCreateCheckoutSessionMutation,
  billingControllerCreatePortalSessionMutation,
  billingControllerGetPlansOptions,
  billingControllerGetSubscriptionPriceOptions,
} from '@lattiz/api-client';
import { toast } from 'sonner';

/** POST /billing/checkout-session → redirect to Stripe Hosted Checkout. */
export function useCreateCheckoutSession() {
  return useMutation({
    ...billingControllerCreateCheckoutSessionMutation(),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => toast.error('No se pudo iniciar el proceso de pago'),
  });
}

/** POST /billing/portal-session → redirect to the Stripe Customer Portal. */
export function useCreatePortalSession() {
  return useMutation({
    ...billingControllerCreatePortalSessionMutation(),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => toast.error('No se pudo abrir el portal de facturación'),
  });
}

/** GET /billing/plans — the catalog prices, straight from Stripe. */
export function useBillingPlans() {
  return useQuery({
    ...billingControllerGetPlansOptions(),
    staleTime: 10 * 60_000,
  });
}

/** GET /billing/subscription/price — what the current subscription is really billed. */
export function useSubscriptionPrice() {
  return useQuery({
    ...billingControllerGetSubscriptionPriceOptions(),
    staleTime: 5 * 60_000,
  });
}
