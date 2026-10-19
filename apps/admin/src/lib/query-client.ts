import { QueryClient } from '@tanstack/react-query';
import { classifyAdminError } from './admin-errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Auth failures are final; retrying them only delays the gate.
      retry: (failureCount, error) =>
        classifyAdminError(error) === 'unknown' && failureCount < 3,
    },
  },
});
