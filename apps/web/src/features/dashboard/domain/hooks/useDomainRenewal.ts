import { useMutation, useQuery } from '@tanstack/react-query';
import {
  domainsControllerCreateRenewalCheckoutMutation,
  domainsControllerGetRenewalOptions,
  type DomainRenewalStatusDto,
} from '@lattiz/api-client';

/** The API answers "no cycle" with an empty body, which the client turns into `{}`, not null. */
export function toRenewalStatus(data: unknown): DomainRenewalStatusDto | null {
  if (typeof data !== 'object' || data === null) return null;
  const candidate = data as Partial<DomainRenewalStatusDto>;
  return typeof candidate.status === 'string' &&
    typeof candidate.expiresAt === 'string'
    ? (candidate as DomainRenewalStatusDto)
    : null;
}

/**
 * GET /domains/renewal — null until the annual window opens.
 * Polls every 10s after payment until the cycle leaves `paid`.
 */
export function useDomainRenewal() {
  return useQuery({
    ...domainsControllerGetRenewalOptions(),
    staleTime: 60_000,
    select: toRenewalStatus,
    refetchInterval: (query) =>
      toRenewalStatus(query.state.data)?.status === 'paid' ? 10_000 : false,
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
