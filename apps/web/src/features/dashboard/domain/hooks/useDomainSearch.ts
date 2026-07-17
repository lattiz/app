import { useQuery } from '@tanstack/react-query';
import { domainsControllerSearchOptions } from '@lattiz/api-client';

/** GET /domains/search?q=… — enabled once a valid query is submitted, always fresh. */
export function useDomainSearch(submittedQuery: string) {
  return useQuery({
    ...domainsControllerSearchOptions({ query: { q: submittedQuery } }),
    enabled: submittedQuery.length >= 2,
    staleTime: 0,
    retry: false,
  });
}
