import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  analyticsControllerOverviewQueryKey,
  analyticsControllerRetryMutation,
} from '@lattiz/api-client';
import { toast } from 'sonner';

/** The generated client throws the raw `{ error: { code, message } }` body. */
function errorMessage(error: unknown): string {
  const message =
    typeof error === 'object' && error !== null
      ? (error as { error?: { message?: unknown } }).error?.message
      : undefined;
  return typeof message === 'string'
    ? message
    : 'No se pudo reintentar. Inténtalo de nuevo.';
}

/** POST /analytics/retry — re-runs a failed GA4 provisioning. */
export function useRetryAnalytics() {
  const queryClient = useQueryClient();
  return useMutation({
    ...analyticsControllerRetryMutation(),
    onSuccess: (data) => {
      queryClient.setQueryData(analyticsControllerOverviewQueryKey(), data);
      void queryClient.invalidateQueries({
        queryKey: analyticsControllerOverviewQueryKey(),
      });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
