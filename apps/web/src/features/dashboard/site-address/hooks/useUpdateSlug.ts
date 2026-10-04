import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tenantsControllerMeQueryKey,
  tenantsControllerSlugAvailabilityQueryKey,
  tenantsControllerUpdateSlugMutation,
} from '@lattiz/api-client';
import { toast } from 'sonner';
import { displayHost } from '@/lib/site-address';
import { slugSaveErrorMessage } from '../lib/slug-errors';

/** PATCH /tenants/me/slug. */
export function useUpdateSlug() {
  const queryClient = useQueryClient();
  return useMutation({
    ...tenantsControllerUpdateSlugMutation(),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      toast.success(`Tu dirección ahora es ${displayHost(data.previewUrl)}.`);
    },
    onError: (err, variables) => {
      toast.error(slugSaveErrorMessage(err));
      // A lost race or a rule change: refresh what the field says about this address.
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerSlugAvailabilityQueryKey({
          query: { slug: variables.body?.slug ?? '' },
        }),
      });
    },
  });
}
