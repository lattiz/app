import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions, type TenantMeResponseDto } from '@lattiz/api-client';
import {
  getMockSite,
  getMockSubscription,
  SIMULATE_ENABLED,
  SIMULATE_STATE,
} from '@/lib/simulate-dashboard-state';
import { useDashboardStore } from '@/stores/dashboard.store';
import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

const SIMULATE = SIMULATE_ENABLED;

function deriveDashboardState(
  tenantMe: TenantMeResponseDto | undefined,
  isLoading: boolean,
): DashboardState {
  if (isLoading || !tenantMe) return 'loading';
  const subStatus = tenantMe.subscription?.status;
  const hasActiveSub = subStatus === 'active' || subStatus === 'trialing';
  if (!hasActiveSub) return 'no-subscription';
  if (!tenantMe.site?.templateId) return 'no-template';
  return 'active';
}

function mapToSiteStatus(tenantMe: TenantMeResponseDto): SiteStatus {
  return {
    isOnline: tenantMe.site?.siteStatus === 'published',
    lastPublished: tenantMe.site?.lastPublishedAt ?? null,
    domain: tenantMe.domain,
    domainConnected: tenantMe.vercelDomainMapped,
    dnsError: tenantMe.domainStatus?.dnsStatus === 'error',
    dnsPropagating: tenantMe.domainStatus?.dnsStatus === 'propagating',
    deployInProgress: false,
    sslActive: tenantMe.domainStatus?.sslActive ?? tenantMe.vercelDomainMapped,
    templateName: tenantMe.site?.templateName ?? null,
    templateId: tenantMe.site?.templateId ?? null,
    visits: null, // TODO: wire when analytics integration exists
    visitsDelta: null,
  };
}

function mapToSubscriptionStatus(tenantMe: TenantMeResponseDto): SubscriptionStatus {
  const sub = tenantMe.subscription;
  return {
    plan: sub?.plan ?? null,
    status: (sub?.status ?? null) as SubscriptionStatus['status'],
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    paymentFailed: sub?.status === 'past_due',
    paymentAttempts: 0,
  };
}

export function useDashboardHome() {
  const state = useDashboardStore((s) => s.state);
  const site = useDashboardStore((s) => s.site);
  const subscription = useDashboardStore((s) => s.subscription);
  const setState = useDashboardStore((s) => s.setState);
  const setSite = useDashboardStore((s) => s.setSite);
  const setSubscription = useDashboardStore((s) => s.setSubscription);

  const tenant = useQuery({ ...tenantsControllerMeOptions(), enabled: !SIMULATE });

  useEffect(() => {
    if (SIMULATE) {
      const s = SIMULATE_STATE;
      setState(s);
      const mockSite = getMockSite(s);
      const mockSub = getMockSubscription(s);
      if (mockSite) setSite(mockSite);
      if (mockSub) setSubscription(mockSub);
      return;
    }

    setState(deriveDashboardState(tenant.data, tenant.isLoading));
    if (tenant.data) {
      setSite(mapToSiteStatus(tenant.data));
      setSubscription(mapToSubscriptionStatus(tenant.data));
    }
  }, [tenant.data, tenant.isLoading, setState, setSite, setSubscription]);

  return { state, site, subscription };
}
