import { useQuery } from '@tanstack/react-query';
import {
  domainsControllerGetDomainOptions,
  type DomainStatusResponseDto,
} from '@lattiz/api-client';

/**
 * GET /domains — the API re-checks DNS propagation on each call.
 * Polls every 10s while propagating, stops once active.
 */
export function useDomainStatus() {
  return useQuery({
    ...domainsControllerGetDomainOptions(),
    // The endpoint is nullable, which hey-api generates as `| unknown` — narrow it.
    select: (data) => (data ?? null) as DomainStatusResponseDto | null,
    refetchInterval: (query) => {
      const status = (query.state.data ?? null) as DomainStatusResponseDto | null;
      return status?.dnsStatus === 'propagating' ? 10_000 : false;
    },
  });
}
