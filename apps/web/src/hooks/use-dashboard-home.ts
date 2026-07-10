import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions, type TenantMeResponseDto } from '@lattiz/api-client';
import {
  getMockSite,
  getMockSubscription,
  SIMULATE_STATE,
} from '@/lib/simulate-dashboard-state';
import { useDashboardStore } from '@/stores/dashboard.store';
import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

const SIMULATE = Boolean(import.meta.env.VITE_SIMULATE_DASHBOARD);

function deriveDashboardState(
  tenantMe: TenantMeResponseDto | undefined,
  isLoading: boolean,
): DashboardState {
  if (isLoading || !tenantMe) return 'loading';
  // No Stripe integration yet — treat all tenants as having an active subscription.
  // TODO: derive from tenantMe.plan / tenantMe.status once Stripe is integrated.
  if (!tenantMe.site?.templateId) return 'no-template';
  return 'active';
}

function mapToSiteStatus(tenantMe: TenantMeResponseDto): SiteStatus {
  return {
    isOnline: tenantMe.site?.siteStatus === 'published',
    lastPublished: tenantMe.site?.lastPublishedAt ?? null,
    domain: tenantMe.domain,
    domainConnected: tenantMe.vercelDomainMapped,
    dnsError: false, // TODO: wire when GoDaddy integration exists
    dnsPropagating: false, // TODO: wire when DNS provisioning exists
    deployInProgress: false,
    sslActive: tenantMe.vercelDomainMapped,
    templateName: tenantMe.site?.templateName ?? null,
    templateId: tenantMe.site?.templateId ?? null,
    visits: null, // TODO: wire when analytics integration exists
    visitsDelta: null,
  };
}

function mapToSubscriptionStatus(tenantMe: TenantMeResponseDto): SubscriptionStatus {
  return {
    plan: tenantMe.plan === 'starter' || tenantMe.plan === 'pro' ? tenantMe.plan : null,
    status: tenantMe.status === 'active' ? 'active' : null,
    currentPeriodEnd: null, // TODO: wire when Stripe integration exists
    paymentFailed: false,
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
