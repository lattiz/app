import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { EVENTS, Joyride, STATUS, type EventData } from 'react-joyride';
import { isDashboardRouteBlocked } from '@/lib/dashboard-access';
import { useDashboardStore } from '@/stores/dashboard.store';
import { buildOnboardingSteps } from './onboarding-steps';
import { OnboardingTooltip } from './OnboardingTooltip';
import { useOnboardingStore } from './onboarding.store';
import { useOnboardingProgress } from './useOnboardingProgress';
import { useTourReadiness } from './useTourReadiness';

// Hard cap on Joyride's waiting overlay between two tooltips.
const STALL_TIMEOUT_MS = 8000;

// Mounted once at DashboardLayout level (not per page) so it survives the
// route changes its own step `before` hooks trigger.
export function OnboardingTour() {
  const navigate = useNavigate();
  const run = useOnboardingStore((s) => s.run);
  const dismissed = useOnboardingStore((s) => s.dismissed);
  const startTour = useOnboardingStore((s) => s.startTour);
  const finishTour = useOnboardingStore((s) => s.finishTour);
  const abortTour = useOnboardingStore((s) => s.abortTour);
  const { isFullyOnboarded, isEntitled } = useOnboardingProgress();

  const steps = buildOnboardingSteps((opts) => {
    // An unentitled tenant gets bounced off gated routes, so the step's target
    // never mounts — stop here instead of parking Joyride on its loader.
    if (isDashboardRouteBlocked(useDashboardStore.getState().state, opts.to)) {
      abortTour();
      return;
    }
    return navigate(opts);
  }, isEntitled);
  const firstTarget =
    typeof steps[0]?.target === 'string' ? steps[0].target : null;
  const ready = useTourReadiness(firstTarget);

  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || !ready || dismissed || isFullyOnboarded) return;
    autoStarted.current = true;
    startTour();
  }, [ready, dismissed, isFullyOnboarded, startTour]);

  const stallTimer = useRef<number | null>(null);
  const clearStallTimer = (): void => {
    if (stallTimer.current === null) return;
    window.clearTimeout(stallTimer.current);
    stallTimer.current = null;
  };
  useEffect(() => {
    if (!run) return;
    return () => {
      if (stallTimer.current !== null) window.clearTimeout(stallTimer.current);
      stallTimer.current = null;
    };
  }, [run]);

  const handleEvent = (data: EventData): void => {
    if (data.type === EVENTS.TOOLTIP || data.type === EVENTS.TOUR_END) {
      clearStallTimer();
    } else if (
      stallTimer.current === null &&
      useOnboardingStore.getState().run
    ) {
      stallTimer.current = window.setTimeout(() => {
        stallTimer.current = null;
        console.warn('[onboarding] tour stalled, aborting');
        abortTour();
      }, STALL_TIMEOUT_MS);
    }

    // Joyride v3 already advances past a missing target in uncontrolled mode.
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      console.warn('[onboarding] target not found:', data.step.target);
      return;
    }

    if (data.type === EVENTS.ERROR) {
      console.warn('[onboarding] tour error:', data.error?.message);
      clearStallTimer();
      abortTour();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      finishTour();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      // Always (re)start at the welcome step — an aborted run leaves Joyride's index mid-tour.
      initialStepIndex={0}
      continuous
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Omitir',
      }}
      tooltipComponent={OnboardingTooltip}
      onEvent={handleEvent}
    />
  );
}
