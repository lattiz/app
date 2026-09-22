import type { Step } from 'react-joyride';
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

export function buildOnboardingSteps(navigate: NavigateFn): Step[] {
  return [
    {
      target: 'body',
      placement: 'center',
      // v3 renamed the old `disableBeacon` step option to `skipBeacon`.
      skipBeacon: true,
      content:
        'Bienvenido a Lattiz. Te mostramos en unos pasos cómo lanzar tu sitio.',
    },
    {
      target: '[data-tour="subscription-cta"]',
      content: 'Primero, activa tu plan para desbloquear el editor.',
      before: () =>
        navigateAndWaitForTarget(
          navigate,
          '/dashboard/subscription',
          '[data-tour="subscription-cta"]',
        ),
    },
    {
      target: '[data-tour="template-gallery"]',
      content: 'Elige la plantilla base para tu negocio.',
      before: () =>
        navigateAndWaitForTarget(
          navigate,
          '/dashboard/templates',
          '[data-tour="template-gallery"]',
        ),
    },
    {
      target: '[data-tour="editor-gateway-card"]',
      content: 'Aquí abres el editor para personalizar tu contenido.',
      before: () =>
        navigateAndWaitForTarget(
          navigate,
          '/dashboard/customization',
          '[data-tour="editor-gateway-card"]',
        ),
    },
    {
      target: '[data-tour="site-settings-section"]',
      content: 'Configura el título, descripción y favicon de tu sitio.',
      // Same route as the previous step — no `before` navigation needed.
    },
    {
      target: '[data-tour="domain-nav-link"]',
      content: 'Conecta o compra tu dominio aquí.',
      before: () =>
        navigateAndWaitForTarget(
          navigate,
          '/dashboard/domain',
          '[data-tour="domain-nav-link"]',
        ),
    },
  ];
}
