export type DashboardState =
  | 'active' // has a template; paid, or still inside the free preview
  | 'no-template' // paid or preview not started, no template selected yet
  | 'trial-expired' // free preview ended; can edit, cannot publish
  | 'no-subscription' // lapsed (or any non-entitled tenant outside the preview)
  | 'no-tenant' // GET /tenants/me failed (no tenant row, or a persistent error)
  | 'loading'; // initial load skeleton

/** Mirrors `TenantMeResponseDto.previewState`. The client never recomputes it. */
export type PreviewState =
  | 'paid'
  | 'trial_unstarted'
  | 'trial_active'
  | 'trial_expired'
  | 'lapsed';

/** Publish / template / paid-feature gates. All four fields come from GET /tenants/me. */
export interface SiteAccess {
  isEntitled: boolean;
  previewState: PreviewState;
  canPublish: boolean;
  previewExpiresAt: string | null;
}

export interface SiteStatus {
  isOnline: boolean;
  lastPublished: string | null;
  domain: string | null;
  /** Free `{slug}.lattiz.app` address. */
  previewUrl: string | null;
  /** Where visitors reach the site now: the custom domain once live, else the preview address. */
  liveUrl: string | null;
  domainConnected: boolean;
  dnsError: boolean;
  dnsPropagating: boolean;
  deployInProgress: boolean;
  sslActive: boolean;
  templateName: string | null;
  templateId: string | null;
  visits: number | null;
  visitsDelta: number | null;
}

export interface SubscriptionStatus {
  plan: 'starter' | 'basico' | 'pro' | null;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  cancelAtPeriodEnd: boolean;
  paymentFailed: boolean;
  paymentAttempts: number;
}
