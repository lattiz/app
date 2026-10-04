import type { EmailKind } from '../domain/email-kinds';
import { renderAccountDeleted } from './account-deleted';
import { renderDomainPurchaseFailed } from './domain-purchase-failed';
import { renderDomainReady } from './domain-ready';
import type { RenderedEmail } from './layout';
import { renderPaymentFailed } from './payment-failed';
import {
  renderDomainExpired,
  renderDomainRenewed,
  renderRenewalLastNotice,
  renderRenewalUpcoming,
} from './renewal';
import { renderSiteReactivated } from './site-reactivated';
import { renderSiteSuspended } from './site-suspended';
import { renderWelcome } from './welcome';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Render a queued email at send time from its kind + payload. */
export function renderEmail(
  kind: EmailKind,
  payload: Record<string, unknown>,
): RenderedEmail {
  switch (kind) {
    case 'welcome':
      return renderWelcome({
        tenantName: asString(payload.tenantName) || undefined,
      });
    case 'payment_failed':
      return renderPaymentFailed({
        attempt: asNumber(payload.attempt, 1),
        maxAttempts: asNumber(payload.maxAttempts, 3),
      });
    case 'site_suspended':
      return renderSiteSuspended({
        domain: asString(payload.domain) || undefined,
      });
    case 'site_reactivated':
      return renderSiteReactivated({
        domain: asString(payload.domain) || undefined,
      });
    case 'domain_ready':
      return renderDomainReady({
        domain: asString(payload.domain, 'tu-dominio'),
      });
    case 'domain_purchase_failed':
      return renderDomainPurchaseFailed({
        domain: asString(payload.domain, 'tu-dominio'),
      });
    case 'account_deleted':
      return renderAccountDeleted();
    case 'renewal_upcoming':
      return renderRenewalUpcoming({
        domain: asString(payload.domain, 'tu-dominio'),
        expiresAt: asString(payload.expiresAt, ''),
      });
    case 'renewal_last_notice':
      return renderRenewalLastNotice({
        domain: asString(payload.domain, 'tu-dominio'),
        expiresAt: asString(payload.expiresAt, ''),
      });
    case 'domain_renewed':
      return renderDomainRenewed({
        domain: asString(payload.domain, 'tu-dominio'),
        expiresAt: asString(payload.expiresAt, ''),
      });
    case 'domain_expired':
      return renderDomainExpired({
        domain: asString(payload.domain, 'tu-dominio'),
      });
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown email kind: ${String(_exhaustive)}`);
    }
  }
}

export type { RenderedEmail };
