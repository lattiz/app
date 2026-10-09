import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { onboardingStepCopy } from '@/lib/trial-copy';

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
  isEntitled: boolean;
  isLoading: boolean;
} {
  const { data: tenantMe, isLoading } = useQuery(tenantsControllerMeOptions());
  const isEntitled = tenantMe?.isEntitled === true;

  const steps: OnboardingStepStatus[] = [
    {
      id: 'template',
      label: onboardingStepCopy.template,
      route: '/dashboard/templates',
      complete: tenantMe?.site?.templateId != null,
    },
    ...(isEntitled
      ? [
          {
            id: 'address',
            label: onboardingStepCopy.address,
            route: '/dashboard/customization' as const,
            complete: tenantMe?.slugIsCustom === true,
          },
        ]
      : []),
    {
      id: 'customize',
      label: onboardingStepCopy.edit,
      route: '/dashboard/customization',
      complete:
        tenantMe?.site?.updatedAt != null &&
        tenantMe.site.createdAt != null &&
        tenantMe.site.updatedAt !== tenantMe.site.createdAt,
    },
    {
      id: 'seo',
      label: onboardingStepCopy.seo,
      route: '/dashboard/customization',
      complete:
        tenantMe?.branding?.seoTitle != null ||
        tenantMe?.branding?.faviconLightUrl != null,
    },
    {
      id: 'publish',
      label: onboardingStepCopy.publish,
      route: '/dashboard/customization',
      complete: tenantMe?.site?.lastPublishedAt != null,
    },
    {
      id: 'domain',
      label: onboardingStepCopy.domain,
      route: isEntitled ? '/dashboard/domain' : '/dashboard/subscription',
      complete: tenantMe?.domainStatus?.dnsStatus === 'active',
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;

  return {
    steps,
    completedCount,
    isFullyOnboarded: completedCount === steps.length,
    isEntitled,
    isLoading,
  };
}
