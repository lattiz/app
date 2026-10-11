import {
  type BusinessProfile,
  displayPhone,
  formatAddress,
  hoursSummary,
  telUrl,
  whatsappUrl,
} from './business-profile';

// Raw and URL-encoded forms: an editor link trait may percent-encode the braces in href.
const TOKEN_RE = /\{\{\s*lz:([a-z_]+)\s*\}\}|%7B%7B\s*lz:([a-z_]+)\s*%7D%7D/gi;

export const SITE_TOKENS = [
  'name',
  'phone',
  'phone_tel',
  'whatsapp_url',
  'email',
  'address',
  'city',
  'hours_summary',
] as const;
export type SiteToken = (typeof SITE_TOKENS)[number];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function tokenValues(
  profile: BusinessProfile,
): Record<SiteToken, string> {
  return {
    name: profile.name ?? '',
    phone: displayPhone(profile.phone),
    phone_tel: telUrl(profile.phone),
    whatsapp_url: whatsappUrl(profile.whatsapp),
    email: profile.email ?? '',
    address: formatAddress(profile),
    city: profile.address?.city ?? '',
    hours_summary: hoursSummary(profile),
  };
}

/**
 * Replaces `{{lz:*}}` with HTML-escaped business data, in text and attributes
 * alike. Unknown or empty tokens become "" — a raw token never reaches visitors.
 */
export function bindSiteTokens(html: string, profile: BusinessProfile): string {
  if (!/\{\{|%7B%7B/i.test(html)) return html;
  const values = tokenValues(profile);
  return html.replace(TOKEN_RE, (_match, raw?: string, encoded?: string) => {
    const key = (raw ?? encoded ?? '').toLowerCase() as SiteToken;
    return Object.hasOwn(values, key) ? escapeHtml(values[key]) : '';
  });
}

/** Fallback when binding fails: drop every token rather than show it. */
export function stripSiteTokens(html: string): string {
  return html.replace(TOKEN_RE, '');
}
