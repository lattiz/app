import { useMutation } from '@tanstack/react-query';
import { domainsControllerGetQuoteMutation } from '@lattiz/api-client';
import { toast } from 'sonner';
import { useDomainWizardStore } from '../store/domain-wizard.store';

/** POST /domains/quote — locks the price for 10 min and moves the wizard to the quote step. */
export function useDomainQuote() {
  return useMutation({
    ...domainsControllerGetQuoteMutation(),
    onSuccess: (quote) => {
      const store = useDomainWizardStore.getState();
      store.setQuote(quote);
      store.setStep('quote');
    },
    onError: () => toast.error('No se pudo obtener el precio'),
  });
}
