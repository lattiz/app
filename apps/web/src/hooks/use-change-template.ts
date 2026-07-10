import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sitesControllerChangeTemplateMutation,
  tenantsControllerMeQueryKey,
} from '@lattiz/api-client';

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: { requiresConfirmation?: boolean };
  };
}

/** The change-template endpoint returns 409 + `details.requiresConfirmation` when the
 * site already has content — the caller must resend with `confirm: true`. */
export function isConflictWithConfirmation(err: unknown): boolean {
  return (err as ApiErrorBody | undefined)?.error?.details?.requiresConfirmation === true;
}

export function useChangeTemplate(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...sitesControllerChangeTemplateMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tenantsControllerMeQueryKey() });
      void queryClient.invalidateQueries({ queryKey: ['editor-project', tenantId] });
    },
  });
}
