import { useQuery } from '@tanstack/react-query';
import { analyticsControllerRealtimeOptions } from '@lattiz/api-client';

/** GET /analytics/realtime — polls every 30s while the tab is visible; failures stay local to the card. */
export function useAnalyticsRealtime(enabled: boolean) {
  return useQuery({
    ...analyticsControllerRealtimeOptions(),
    enabled,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: false,
  });
}
