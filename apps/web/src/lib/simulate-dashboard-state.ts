import type {
  DashboardState,
  SiteAccess,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

// VITE_SIMULATE_DASHBOARD selects a mocked dashboard state for local dev.
// The special value 'live' turns simulation OFF: the dashboard renders from the
// real /tenants/me response with no mock overrides. Any recognized state
// ('active' | 'no-template' | 'trial-expired' | 'no-subscription' | 'no-tenant' | 'loading')
// forces that mock. 'trial_active' renders the active dashboard with a live
// preview; 'trial_unstarted' renders no-template with publish still allowed.
const RAW_SIMULATE = import.meta.env.VITE_SIMULATE_DASHBOARD as
  | string
  | undefined;

/** True only when a mocked state is active. 'live' (or unset) → real API data. */
export const SIMULATE_ENABLED =
  RAW_SIMULATE != null && RAW_SIMULATE !== '' && RAW_SIMULATE !== 'live';

function resolveSimulatedState(raw: string): DashboardState {
  if (raw === 'trial_active' || raw === 'trial-active') return 'active';
  if (raw === 'trial_unstarted' || raw === 'trial-unstarted') return 'no-template';
  return raw as DashboardState;
}

export const SIMULATE_STATE: DashboardState = SIMULATE_ENABLED
  ? resolveSimulatedState(RAW_SIMULATE as string)
  : 'active';

const MOCK_SITE: Record<DashboardState, SiteStatus | null> = {
  loading: null,
  'no-tenant': null,
  active: {
    isOnline: true,
    lastPublished: '2026-07-04T10:00:00Z',
    domain: 'minegocio.com',
    previewUrl: 'https://minegocio.lattiz.app',
    liveUrl: 'https://minegocio.com',
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
    previewUrl: null,
    liveUrl: null,
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
    previewUrl: null,
    liveUrl: null,
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
  'trial-expired': {
    isOnline: true,
    lastPublished: '2026-06-01T10:00:00Z',
    domain: null,
    previewUrl: 'https://minegocio.lattiz.app',
    liveUrl: 'https://minegocio.lattiz.app',
    domainConnected: false,
    dnsError: false,
    dnsPropagating: false,
    deployInProgress: false,
    sslActive: false,
    templateName: 'Modern Pro',
    templateId: 'modern-pro-v1',
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
    cancelAt: null,
    cancelAtPeriodEnd: false,
    paymentFailed: false,
    paymentAttempts: 0,
  },
  'no-template': {
    plan: 'starter',
    status: 'trialing',
    currentPeriodEnd: '2026-07-18',
    cancelAt: null,
    cancelAtPeriodEnd: false,
    paymentFailed: false,
    paymentAttempts: 0,
  },
  'no-subscription': {
    plan: null,
    status: null,
    currentPeriodEnd: null,
    cancelAt: null,
    cancelAtPeriodEnd: false,
    paymentFailed: false,
    paymentAttempts: 0,
  },
  'trial-expired': {
    plan: null,
    status: null,
    currentPeriodEnd: null,
    cancelAt: null,
    cancelAtPeriodEnd: false,
    paymentFailed: false,
    paymentAttempts: 0,
  },
};

const PAID_ACCESS: SiteAccess = {
  isEntitled: true,
  previewState: 'paid',
  canPublish: true,
  previewExpiresAt: null,
};

const LAPSED_ACCESS: SiteAccess = {
  isEntitled: false,
  previewState: 'lapsed',
  canPublish: false,
  previewExpiresAt: null,
};

const TRIAL_ACTIVE_ACCESS: SiteAccess = {
  isEntitled: false,
  previewState: 'trial_active',
  canPublish: true,
  previewExpiresAt: '2026-10-20T00:00:00.000Z',
};

const TRIAL_UNSTARTED_ACCESS: SiteAccess = {
  isEntitled: false,
  previewState: 'trial_unstarted',
  canPublish: true,
  previewExpiresAt: null,
};

const TRIAL_EXPIRED_ACCESS: SiteAccess = {
  isEntitled: false,
  previewState: 'trial_expired',
  canPublish: false,
  previewExpiresAt: '2026-06-15T00:00:00.000Z',
};

const MOCK_ACCESS: Record<DashboardState, SiteAccess | null> = {
  loading: null,
  'no-tenant': null,
  active: PAID_ACCESS,
  'no-template': PAID_ACCESS,
  'no-subscription': LAPSED_ACCESS,
  'trial-expired': TRIAL_EXPIRED_ACCESS,
};

function accessForRaw(raw: string, state: DashboardState): SiteAccess | null {
  if (raw === 'trial_active' || raw === 'trial-active') return TRIAL_ACTIVE_ACCESS;
  if (raw === 'trial_unstarted' || raw === 'trial-unstarted') {
    return TRIAL_UNSTARTED_ACCESS;
  }
  return MOCK_ACCESS[state];
}

/** Access flags paired with the active simulation, or null when simulation is off. */
export const SIMULATE_ACCESS: SiteAccess | null = SIMULATE_ENABLED
  ? accessForRaw(RAW_SIMULATE as string, SIMULATE_STATE)
  : null;

export function getMockSite(state: DashboardState): SiteStatus | null {
  return MOCK_SITE[state];
}

export function getMockSubscription(
  state: DashboardState,
): SubscriptionStatus | null {
  return MOCK_SUB[state];
}
