import { useMutation, useQuery } from '@tanstack/react-query';
import {
  domainsControllerCreateRenewalCheckoutMutation,
  domainsControllerGetRenewalOptions,
  type DomainRenewalStatusDto,
} from '@lattiz/api-client';

/**
 * GET /domains/renewal — null until the annual window opens.
 * Polls every 10s after payment until the cycle leaves `paid`.
 */
export function useDomainRenewal() {
  return useQuery({
    ...domainsControllerGetRenewalOptions(),
    staleTime: 60_000,
    select: (data) => (data ?? null) as DomainRenewalStatusDto | null,
    refetchInterval: (query) => {
      const status = (query.state.data ??
        null) as DomainRenewalStatusDto | null;
      return status?.status === 'paid' ? 10_000 : false;
    },
  });
}

/** POST /domains/renewal/checkout → redirect to Stripe Hosted Checkout. */
export function useRenewalCheckout() {
  return useMutation({
    ...domainsControllerCreateRenewalCheckoutMutation(),
    onSuccess: (data) => {
      window.location.assign(data.url);
    },
  });
}
