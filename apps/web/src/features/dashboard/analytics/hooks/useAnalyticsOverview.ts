import { useQuery } from '@tanstack/react-query';
import { analyticsControllerOverviewOptions } from '@lattiz/api-client';

/** GET /analytics/overview — polls every 3s while GA4 is being provisioned. */
export function useAnalyticsOverview() {
  return useQuery({
    ...analyticsControllerOverviewOptions(),
    staleTime: 5 * 60_000,
    refetchInterval: (query) =>
      query.state.data?.status === 'provisioning' ? 3000 : false,
  });
}
