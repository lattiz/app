import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sitesControllerSelectTemplateMutation,
  tenantsControllerMeQueryKey,
} from '@lattiz/api-client';

export function useSelectTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    ...sitesControllerSelectTemplateMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tenantsControllerMeQueryKey() });
    },
  });
}
