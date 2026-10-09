import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  EVENTS,
  Joyride,
  STATUS,
  type Controls,
  type EventData,
} from 'react-joyride';
import { buildOnboardingSteps } from './onboarding-steps';
import { OnboardingTooltip } from './OnboardingTooltip';
import { useOnboardingStore } from './onboarding.store';
import { useOnboardingProgress } from './useOnboardingProgress';

// Mounted once at DashboardLayout level (not per page) so it survives the
// route changes its own step `before` hooks trigger.
export function OnboardingTour() {
  const navigate = useNavigate();
  const run = useOnboardingStore((s) => s.run);
  const dismissed = useOnboardingStore((s) => s.dismissed);
  const startTour = useOnboardingStore((s) => s.startTour);
  const finishTour = useOnboardingStore((s) => s.finishTour);
  const { isFullyOnboarded, isEntitled, isLoading } = useOnboardingProgress();

  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || isLoading || dismissed || isFullyOnboarded)
      return;
    autoStarted.current = true;
    startTour();
  }, [isLoading, dismissed, isFullyOnboarded, startTour]);

  const steps = buildOnboardingSteps((opts) => navigate(opts), isEntitled);

  const handleEvent = (data: EventData, controls: Controls): void => {
    // Never let a missing target hang the tour — advance past it instead.
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      console.warn('[onboarding] target not found:', data.step.target);
      controls.next();
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
