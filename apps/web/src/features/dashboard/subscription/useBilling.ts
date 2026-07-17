import { useMutation } from '@tanstack/react-query';
import {
  billingControllerCreateCheckoutSessionMutation,
  billingControllerCreatePortalSessionMutation,
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
