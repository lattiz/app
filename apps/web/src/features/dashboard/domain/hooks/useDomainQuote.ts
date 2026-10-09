import { useMutation } from '@tanstack/react-query';
import { domainsControllerGetQuoteMutation } from '@lattiz/api-client';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  domainCoverageCopy,
  offersProUpgrade,
  quoteNotCoveredMessage,
} from '../lib/domain-copy';
import { quoteErrorMessage } from '../lib/domain-errors';
import { useDomainWizardStore } from '../store/domain-wizard.store';

/** POST /domains/quote — confirms availability and moves the wizard to the quote step. */
export function useDomainQuote() {
  const navigate = useNavigate();

  return useMutation({
    ...domainsControllerGetQuoteMutation(),
    onSuccess: (quote) => {
      const store = useDomainWizardStore.getState();
      if (!quote.available) {
        toast.error(domainCoverageCopy.noLongerAvailable);
        store.backToSearch();
        return;
      }
      if (offersProUpgrade(quote)) {
        toast(domainCoverageCopy.upgradeMessage, {
          action: {
            label: domainCoverageCopy.upgradeCta,
            onClick: () => void navigate({ to: '/dashboard/subscription' }),
          },
        });
        store.backToSearch();
        return;
      }
      if (!quote.coveredByPlan) {
        toast.error(quoteNotCoveredMessage(quote.notCoveredReason));
        store.backToSearch();
        return;
      }
      store.setQuote(quote);
      store.setStep('quote');
    },
    onError: (error) => toast.error(quoteErrorMessage(error)),
  });
}
