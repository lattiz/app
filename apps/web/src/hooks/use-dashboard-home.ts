import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions, type TenantMeResponseDto } from '@lattiz/api-client';
import {
  getMockSite,
  getMockSubscription,
  SIMULATE_ENABLED,
  SIMULATE_STATE,
} from '@/lib/simulate-dashboard-state';
import { liveSiteUrl } from '@/lib/site-address';
import { useDashboardStore } from '@/stores/dashboard.store';
import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

const SIMULATE = SIMULATE_ENABLED;

/**
 * The generated client throws the raw DomainExceptionFilter body on a
 * non-2xx response (`{ error: { code, message } }`) — not an Error with a
 * `.response.status` — so a 404 is identified by `error.code`, not a status.
 */
function isTenantNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { error?: { code?: unknown } }).error?.code === 'TENANT_NOT_FOUND'
  );
}

function deriveDashboardState(
  tenantMe: TenantMeResponseDto | undefined,
  isLoading: boolean,
  isSettledError: boolean,
): DashboardState {
  if (isLoading) return 'loading';
  if (isSettledError || !tenantMe) return 'no-tenant';
  // `isEntitled` is the backend's single source of truth: status alone still
  // reads 'active' whenever a Stripe webhook was missed past current_period_end.
  if (!tenantMe.isEntitled) return 'no-subscription';
  if (!tenantMe.site?.templateId) return 'no-template';
  return 'active';
}

function mapToSiteStatus(tenantMe: TenantMeResponseDto): SiteStatus {
  return {
    isOnline: tenantMe.site?.siteStatus === 'published',
    lastPublished: tenantMe.site?.lastPublishedAt ?? null,
    domain: tenantMe.domain,
    previewUrl: tenantMe.previewUrl,
    liveUrl: liveSiteUrl(tenantMe),
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

  const tenant = useQuery({
    ...tenantsControllerMeOptions(),
    enabled: !SIMULATE,
    // TENANT_NOT_FOUND retries are handled below via refetchInterval instead —
    // the default retry backoff would otherwise waste time on an error that
    // won't resolve itself faster than the trigger-provisioning race allows.
    retry: (failureCount, error) =>
      isTenantNotFoundError(error) ? false : failureCount < 2,
    refetchInterval: (query) => {
      // A brand-new signup's tenants row lands via a DB trigger in the same
      // transaction, so this is normally already committed — but as a safety
      // net, retry once ~2s after a TENANT_NOT_FOUND before giving up.
      if (!isTenantNotFoundError(query.state.error)) return false;
      return query.state.errorUpdateCount < 2 ? 2000 : false;
    },
  });

  const isOnboardingRetryPending =
    isTenantNotFoundError(tenant.error) && tenant.errorUpdateCount < 2;
  const isSettledError = tenant.isError && !isOnboardingRetryPending;

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

    setState(deriveDashboardState(tenant.data, tenant.isLoading, isSettledError));
    if (tenant.data) {
      setSite(mapToSiteStatus(tenant.data));
      setSubscription(mapToSubscriptionStatus(tenant.data));
    }
  }, [tenant.data, tenant.isLoading, isSettledError, setState, setSite, setSubscription]);

  return { state, site, subscription };
}
