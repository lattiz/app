import type { Step } from 'react-joyride';
import { onboardingTourCopy } from '@/lib/trial-copy';
import type { OnboardingRoute } from './useOnboardingProgress';

type NavigateFn = (opts: { to: OnboardingRoute }) => Promise<void> | void;

// Navigate then wait for the target selector to mount. Polls briefly rather
// than a fixed setTimeout — route transitions and data fetches vary in
// duration. Never throws: react-joyride's own TARGET_NOT_FOUND handling
// (see OnboardingTour) advances the tour if the target never appears.
async function navigateAndWaitForTarget(
  navigate: NavigateFn,
  to: OnboardingRoute,
  targetSelector: string,
  timeoutMs = 4000,
): Promise<void> {
  await navigate({ to });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (document.querySelector(targetSelector)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export function buildOnboardingSteps(
  navigate: NavigateFn,
  isEntitled: boolean,
): Step[] {
  const openCustomization = (targetSelector: string) =>
    navigateAndWaitForTarget(
      navigate,
      '/dashboard/customization',
      targetSelector,
    );

  return [
    {
      target: 'body',
      placement: 'center',
      // v3 renamed the old `disableBeacon` step option to `skipBeacon`.
      skipBeacon: true,
      content: onboardingTourCopy.welcome,
    },
    {
      target: '[data-tour="template-gallery"]',
      content: onboardingTourCopy.template,
      before: () =>
        navigateAndWaitForTarget(
          navigate,
          '/dashboard/templates',
          '[data-tour="template-gallery"]',
        ),
    },
    ...(isEntitled
      ? [
          {
            target: '[data-tour="site-address-section"]',
            content: onboardingTourCopy.address,
            before: () =>
              openCustomization('[data-tour="site-address-section"]'),
          },
        ]
      : []),
    {
      target: '[data-tour="editor-gateway-card"]',
      content: onboardingTourCopy.edit,
      // The address step already opened this route when the tenant has a plan.
      ...(isEntitled
        ? {}
        : {
            before: () =>
              openCustomization('[data-tour="editor-gateway-card"]'),
          }),
    },
    {
      target: '[data-tour="site-settings-section"]',
      content: onboardingTourCopy.seo,
    },
    {
      target: '[data-tour="domain-nav-link"]',
      content: onboardingTourCopy.domain,
      before: () =>
        navigateAndWaitForTarget(
          navigate,
          '/dashboard/domain',
          '[data-tour="domain-nav-link"]',
        ),
    },
  ];
}
