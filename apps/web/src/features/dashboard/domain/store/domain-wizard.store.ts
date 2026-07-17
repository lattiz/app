import { create } from 'zustand';
import type { DomainQuoteResponseDto } from '@lattiz/api-client';

export type WizardStep =
  | 'search'
  | 'quote'
  | 'purchasing'
  | 'propagating'
  | 'active';

interface DomainWizardState {
  step: WizardStep;
  searchQuery: string;
  selectedDomain: string | null;
  quote: DomainQuoteResponseDto | null;
  jobId: string | null;
  agreementsAccepted: string[];
  /** ISO timestamp of the user's real "Acepto" click — sent as legal consent. */
  agreedAt: string | null;

  setStep: (step: WizardStep) => void;
  setSearchQuery: (q: string) => void;
  selectDomain: (domain: string) => void;
  setQuote: (quote: DomainQuoteResponseDto) => void;
  setJobId: (jobId: string) => void;
  toggleAgreement: (agreementType: string) => void;
  backToSearch: () => void;
  reset: () => void;
}

const initialState = {
  step: 'search' as WizardStep,
  searchQuery: '',
  selectedDomain: null,
  quote: null,
  jobId: null,
  agreementsAccepted: [],
  agreedAt: null,
};

export const useDomainWizardStore = create<DomainWizardState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectDomain: (selectedDomain) => set({ selectedDomain }),
  setQuote: (quote) => set({ quote, agreementsAccepted: [], agreedAt: null }),
  setJobId: (jobId) => set({ jobId }),
  toggleAgreement: (agreementType) =>
    set((s) => {
      const accepted = s.agreementsAccepted.includes(agreementType)
        ? s.agreementsAccepted.filter((a) => a !== agreementType)
        : [...s.agreementsAccepted, agreementType];
      return { agreementsAccepted: accepted, agreedAt: new Date().toISOString() };
    }),
  backToSearch: () =>
    set({
      step: 'search',
      selectedDomain: null,
      quote: null,
      agreementsAccepted: [],
      agreedAt: null,
    }),
  reset: () => set(initialState),
}));
