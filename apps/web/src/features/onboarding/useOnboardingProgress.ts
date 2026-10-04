import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';

export interface OnboardingStepStatus {
  id: string;
  label: string;
  route: OnboardingRoute;
  complete: boolean;
}

// The finite set of routes the tour/panel ever link to — keeps `navigate({ to })`
// calls type-safe against TanStack Router's registered route literals.
export type OnboardingRoute =
  | '/dashboard/subscription'
  | '/dashboard/templates'
  | '/dashboard/customization'
  | '/dashboard/domain';

// Pure derivation from TenantMe — every step resolves to a definite boolean,
// never undefined, so the panel/tour never render a partial state.
export function useOnboardingProgress(): {
  steps: OnboardingStepStatus[];
  completedCount: number;
  isFullyOnboarded: boolean;
  isLoading: boolean;
} {
  const { data: tenantMe, isLoading } = useQuery(tenantsControllerMeOptions());

  const steps: OnboardingStepStatus[] = [
    {
      id: 'subscription',
      label: 'Activa tu suscripción',
      route: '/dashboard/subscription',
      // isEntitled is top-level on TenantMe, not nested under subscription —
      // it's the only value the guard and the rest of the app trust.
      complete: tenantMe?.isEntitled === true,
    },
    {
      id: 'template',
      label: 'Elige tu plantilla',
      route: '/dashboard/templates',
      complete: tenantMe?.site?.templateId != null,
    },
    {
      id: 'address',
      label: 'Elige la dirección de tu sitio',
      route: '/dashboard/customization',
      complete: tenantMe?.slugIsCustom === true,
    },
    {
      id: 'customize',
      label: 'Personaliza tu sitio',
      route: '/dashboard/customization',
      complete:
        tenantMe?.site?.updatedAt != null &&
        tenantMe.site.createdAt != null &&
        tenantMe.site.updatedAt !== tenantMe.site.createdAt,
    },
    {
      id: 'seo',
      label: 'Configura el SEO y la marca',
      route: '/dashboard/customization',
      // SEO/branding fields live under `branding`, not on the tenant directly.
      complete:
        tenantMe?.branding?.seoTitle != null ||
        tenantMe?.branding?.faviconLightUrl != null,
    },
    {
      id: 'domain',
      label: 'Conecta tu dominio',
      route: '/dashboard/domain',
      complete: tenantMe?.domainStatus?.dnsStatus === 'active',
    },
    {
      id: 'publish',
      label: 'Publica tu sitio',
      route: '/dashboard/customization',
      complete: tenantMe?.site?.lastPublishedAt != null,
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;

  return {
    steps,
    completedCount,
    isFullyOnboarded: completedCount === steps.length,
    isLoading,
  };
}
