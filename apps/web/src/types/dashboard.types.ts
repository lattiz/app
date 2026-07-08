export type DashboardState =
  | 'active' // has template + active subscription + site published
  | 'no-template' // subscription active, no template selected
  | 'no-subscription' // no active subscription
  | 'loading'; // initial load skeleton

export interface SiteStatus {
  isOnline: boolean;
  lastPublished: string | null;
  domain: string | null;
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
  plan: 'starter' | 'pro' | null;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | null;
  currentPeriodEnd: string | null;
  paymentFailed: boolean;
  paymentAttempts: number;
}
