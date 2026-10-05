export type DashboardState =
  | 'active' // has template + active subscription + site published
  | 'no-template' // subscription active, no template selected
  | 'no-subscription' // no active subscription
  | 'no-tenant' // GET /tenants/me failed (no tenant row, or a persistent error)
  | 'loading'; // initial load skeleton

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
