import type { BusinessProfile } from '../../../../apps/tenant-sites/lib/business-profile';
import { bindSiteTokens } from '../../../../apps/tenant-sites/lib/site-tokens';
import type { Business } from '../types';

/** The street part of a demo address: tenant-sites appends the city itself (`formatAddress`). */
export function streetOf(business: Business): string {
  const suffix = `, ${business.city}`;
  return business.city &&
    business.address.toLowerCase().endsWith(suffix.toLowerCase())
    ? business.address.slice(0, -suffix.length)
    : business.address;
}

/** The business_profile a template's demo data stands for (contact fields only). */
export function contactProfile(business: Business): BusinessProfile {
  return {
    name: business.name,
    phone: business.phone.replace(/[^\d+]/g, ''),
    whatsapp: `+${business.whatsapp.replace(/\D/g, '')}`,
    email: business.email,
    address: { street: streetOf(business), city: business.city, country: 'MX' },
  };
}

/** Static previews show the demo data through the same binding tenant-sites runs at serve time. */
export function bindDemoTokens(html: string, business: Business): string {
  return bindSiteTokens(html, contactProfile(business));
}
