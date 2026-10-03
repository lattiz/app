import { useMutation } from '@tanstack/react-query';
import { domainsControllerGetQuoteMutation } from '@lattiz/api-client';
import { toast } from 'sonner';
import { quoteErrorMessage } from '../lib/domain-errors';
import { useDomainWizardStore } from '../store/domain-wizard.store';

/** POST /domains/quote — returns the current price and moves the wizard to the quote step. */
export function useDomainQuote() {
  return useMutation({
    ...domainsControllerGetQuoteMutation(),
    onSuccess: (quote) => {
      const store = useDomainWizardStore.getState();
      if (!quote.available || !quote.coveredByPlan) {
        toast.error(
          quote.available
            ? 'Tu plan no cubre este dominio. Elige otro.'
            : 'Este dominio ya no está disponible. Elige otro.',
        );
        store.backToSearch();
        return;
      }
      store.setQuote(quote);
      store.setStep('quote');
    },
    onError: (error) => toast.error(quoteErrorMessage(error)),
  });
}
