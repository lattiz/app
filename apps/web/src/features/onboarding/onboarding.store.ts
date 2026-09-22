import { create } from 'zustand';

const DISMISS_KEY = 'lattiz-onboarding-dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

interface OnboardingStore {
  run: boolean;
  dismissed: boolean;
  /** Starts the tour, bypassing the dismissal flag (used by the manual "Ver tour guiado" entry point). */
  startTour: () => void;
  /** Stops the tour and persists the dismissal so it doesn't auto-start again. */
  finishTour: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  run: false,
  dismissed: readDismissed(),
  startTour: () => set({ run: true }),
  finishTour: () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Best-effort — a blocked/private-mode localStorage just means the
      // tour may auto-start again next visit, which is harmless.
    }
    set({ run: false, dismissed: true });
  },
}));
