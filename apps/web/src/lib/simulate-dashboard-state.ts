import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

// VITE_SIMULATE_DASHBOARD selects a mocked dashboard state for local dev.
// The special value 'live' turns simulation OFF: the dashboard renders from the
// real /tenants/me response with no mock overrides. Any recognized state
// ('active' | 'no-template' | 'no-subscription' | 'no-tenant' | 'loading')
// forces that mock.
const RAW_SIMULATE = import.meta.env.VITE_SIMULATE_DASHBOARD as
  | string
  | undefined;

/** True only when a mocked state is active. 'live' (or unset) → real API data. */
export const SIMULATE_ENABLED =
  RAW_SIMULATE != null && RAW_SIMULATE !== '' && RAW_SIMULATE !== 'live';

export const SIMULATE_STATE: DashboardState = SIMULATE_ENABLED
  ? (RAW_SIMULATE as DashboardState)
  : 'active';

const MOCK_SITE: Record<DashboardState, SiteStatus | null> = {
  loading: null,
  'no-tenant': null,
  active: {
    isOnline: true,
    lastPublished: '2026-07-04T10:00:00Z',
    domain: 'minegocio.com',
    domainConnected: true,
    dnsError: false,
    dnsPropagating: false,
    deployInProgress: false,
    sslActive: true,
    templateName: 'Modern Pro',
    templateId: 'modern-pro-v1',
    visits: 1240,
    visitsDelta: 12,
  },
  'no-template': {
    isOnline: false,
    lastPublished: null,
    domain: null,
    domainConnected: false,
    dnsError: false,
    dnsPropagating: false,
    deployInProgress: false,
    sslActive: false,
    templateName: null,
    templateId: null,
    visits: null,
    visitsDelta: null,
  },
  'no-subscription': {
    isOnline: false,
    lastPublished: null,
    domain: null,
    domainConnected: false,
    dnsError: false,
    dnsPropagating: false,
    deployInProgress: false,
    sslActive: false,
    templateName: null,
    templateId: null,
    visits: null,
    visitsDelta: null,
  },
};

const MOCK_SUB: Record<DashboardState, SubscriptionStatus | null> = {
  loading: null,
  'no-tenant': null,
  active: {
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: '2026-08-15',
    paymentFailed: false,
    paymentAttempts: 0,
  },
  'no-template': {
    plan: 'starter',
    status: 'trialing',
    currentPeriodEnd: '2026-07-18',
    paymentFailed: false,
    paymentAttempts: 0,
  },
  'no-subscription': {
    plan: null,
    status: null,
    currentPeriodEnd: null,
    paymentFailed: false,
    paymentAttempts: 0,
  },
};

export function getMockSite(state: DashboardState): SiteStatus | null {
  return MOCK_SITE[state];
}

export function getMockSubscription(
  state: DashboardState,
): SubscriptionStatus | null {
  return MOCK_SUB[state];
}
