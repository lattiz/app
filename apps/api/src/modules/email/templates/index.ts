import type { EmailKind } from '../domain/email-kinds';
import { renderAccountDeleted } from './account-deleted';
import { renderAdminAlert } from './admin-alert';
import { renderDomainPurchaseFailed } from './domain-purchase-failed';
import { renderDomainReady } from './domain-ready';
import type { RenderedEmail } from './layout';
import { renderPaymentFailed } from './payment-failed';
import { renderPreviewEnding } from './preview-ending';
import {
  type RenewalEmailData,
  renderDomainExpired,
  renderDomainLost,
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

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function renewalData(payload: Record<string, unknown>): RenewalEmailData {
  const late = payload.lateDeadlineAt;
  return {
    domain: asString(payload.domain, 'tu-dominio'),
    expiresAt: asString(payload.expiresAt, ''),
    lateDeadlineAt: typeof late === 'string' ? late : null,
    daysLeft: asNumber(payload.daysLeft, 0),
    baseCents: asNumber(payload.baseCents, 0),
    taxCents: asNumber(payload.taxCents, 0),
    totalCents: asNumber(payload.totalCents, 0),
    currency: asString(payload.currency, 'mxn'),
    subscriptionActive: asBoolean(payload.subscriptionActive, true),
    siteWasOffline: payload.siteWasOffline === true,
  };
}

function asDetails(
  value: unknown,
): Record<string, string | number | null> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const details: Record<string, string | number | null> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' || typeof item === 'number' || item === null) {
      details[key] = item;
    }
  }
  return details;
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
      return renderRenewalUpcoming(renewalData(payload));
    case 'renewal_last_notice':
      return renderRenewalLastNotice(renewalData(payload));
    case 'domain_renewed':
      return renderDomainRenewed(renewalData(payload));
    case 'domain_expired':
      return renderDomainExpired(renewalData(payload));
    case 'domain_lost':
      return renderDomainLost(renewalData(payload));
    case 'admin_alert':
      return renderAdminAlert({
        title: asString(payload.title, 'Aviso'),
        summary: asString(payload.summary, ''),
        details: asDetails(payload.details),
      });
    case 'preview_ending':
      return renderPreviewEnding({
        endsAt: asString(payload.endsAt, ''),
        siteName: asString(payload.siteName, ''),
      });
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown email kind: ${String(_exhaustive)}`);
    }
  }
}

export type { RenderedEmail };
