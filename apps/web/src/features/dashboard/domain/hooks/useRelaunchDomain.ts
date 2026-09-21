import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  domainsControllerGetDomainQueryKey,
  domainsControllerRelaunchMutation,
  tenantsControllerMeQueryKey,
} from '@lattiz/api-client';
import { toast } from 'sonner';
import { useDomainWizardStore } from '../store/domain-wizard.store';

/** POST /domains/relaunch — restores the Vercel mapping of a suspended domain. */
export function useRelaunchDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    ...domainsControllerRelaunchMutation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantsControllerMeQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: domainsControllerGetDomainQueryKey(),
        }),
      ]);
      toast.success('Sitio reactivado. Emitiendo certificado SSL…');
      useDomainWizardStore.getState().setStep('propagating');
    },
    onError: () =>
      toast.error('No se pudo reactivar tu sitio. Inténtalo de nuevo.'),
  });
}
