import { useMutation, useQuery } from '@tanstack/react-query';
import {
  domainsControllerGetJobStatusOptions,
  domainsControllerPurchaseMutation,
} from '@lattiz/api-client';
import { toast } from 'sonner';
import { apiErrorCode, purchaseErrorMessage } from '../lib/domain-errors';
import { useDomainWizardStore } from '../store/domain-wizard.store';

/** POST /domains/purchase — returns { jobId } immediately, pipeline runs server-side. */
export function useDomainPurchase() {
  return useMutation({
    ...domainsControllerPurchaseMutation(),
    onSuccess: ({ jobId }) => {
      const store = useDomainWizardStore.getState();
      store.setJobId(jobId);
      store.setStep('purchasing');
    },
    onError: (error) => {
      const store = useDomainWizardStore.getState();
      const code = apiErrorCode(error);
      if (code === 'DOMAIN_NOT_AVAILABLE' || code === 'DOMAIN_NOT_COVERED_BY_PLAN') {
        store.backToSearch();
      }
      toast.error(purchaseErrorMessage(error));
    },
  });
}

/** Polls GET /domains/jobs/:jobId every 2s until the pipeline completes or fails. */
export function useDomainJob(jobId: string | null) {
  return useQuery({
    ...domainsControllerGetJobStatusOptions({ path: { jobId: jobId ?? '' } }),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'completed' || status === 'failed' ? false : 2000;
    },
  });
}
