import { useQuery } from '@tanstack/react-query';
import { domainsControllerSearchOptions } from '@lattiz/api-client';

const SEARCH_STALE_MS = 5 * 60_000;

/** GET /domains/search?q=… — runs when the user submits a query. Quote and purchase recheck availability. */
export function useDomainSearch(submittedQuery: string) {
  return useQuery({
    ...domainsControllerSearchOptions({ query: { q: submittedQuery } }),
    enabled: submittedQuery.length >= 2,
    staleTime: SEARCH_STALE_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
