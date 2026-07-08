import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

export const SIMULATE_STATE: DashboardState =
  (import.meta.env.VITE_SIMULATE_DASHBOARD as DashboardState | undefined) ??
  'active';

const MOCK_SITE: Record<DashboardState, SiteStatus | null> = {
  loading: null,
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
