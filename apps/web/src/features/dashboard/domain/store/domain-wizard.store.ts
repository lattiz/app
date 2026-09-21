import { create } from 'zustand';
import type {
  CnameInstructionDto,
  DomainQuoteResponseDto,
} from '@lattiz/api-client';

export type WizardStep =
  | 'entry'
  | 'search'
  | 'quote'
  | 'purchasing'
  | 'connect-form'
  | 'dns-instructions'
  | 'propagating'
  | 'active'
  | 'suspended';

export type DomainSource = 'godaddy_managed' | 'user_provided';

interface DomainWizardState {
  step: WizardStep;
  searchQuery: string;
  selectedDomain: string | null;
  quote: DomainQuoteResponseDto | null;
  jobId: string | null;
  agreementsAccepted: string[];
  /** ISO timestamp of the user's real "Acepto" click — sent as legal consent. */
  agreedAt: string | null;
  domainSource: DomainSource | null;
  dnsInstructions: CnameInstructionDto[] | null;

  setStep: (step: WizardStep) => void;
  setSearchQuery: (q: string) => void;
  selectDomain: (domain: string) => void;
  setQuote: (quote: DomainQuoteResponseDto) => void;
  setJobId: (jobId: string) => void;
  toggleAgreement: (agreementType: string) => void;
  setDomainSource: (source: DomainSource) => void;
  setDnsInstructions: (instructions: CnameInstructionDto[]) => void;
  backToSearch: () => void;
  reset: () => void;
}

const initialState = {
  step: 'entry' as WizardStep,
  searchQuery: '',
  selectedDomain: null,
  quote: null,
  jobId: null,
  agreementsAccepted: [],
  agreedAt: null,
  domainSource: null as DomainSource | null,
  dnsInstructions: null,
};

export const useDomainWizardStore = create<DomainWizardState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectDomain: (selectedDomain) => set({ selectedDomain }),
  setQuote: (quote) => set({ quote, agreementsAccepted: [], agreedAt: null }),
  setJobId: (jobId) => set({ jobId }),
  setDomainSource: (domainSource) => set({ domainSource }),
  setDnsInstructions: (dnsInstructions) => set({ dnsInstructions }),
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
