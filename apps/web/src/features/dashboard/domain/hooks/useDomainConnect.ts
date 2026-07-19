import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  domainsControllerConnectMutation,
  tenantsControllerMeQueryKey,
} from '@lattiz/api-client';
import { toast } from 'sonner';
import { useDomainWizardStore } from '../store/domain-wizard.store';

/** POST /domains/connect — maps the tenant-owned domain in Vercel and returns the CNAMEs to create. */
export function useDomainConnect() {
  const queryClient = useQueryClient();
  return useMutation({
    ...domainsControllerConnectMutation(),
    onSuccess: (data) => {
      const store = useDomainWizardStore.getState();
      store.setJobId(data.jobId);
      store.setDnsInstructions(data.dnsInstructions);
      store.setStep('dns-instructions');
      toast.success('Dominio conectado. Configura los registros DNS.');
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
    },
    onError: () =>
      toast.error('No se pudo conectar el dominio. Verifica que sea válido.'),
  });
}
