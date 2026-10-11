import {
  type BusinessProfile,
  DEFAULT_TIMEZONE,
  type TimeRange,
  WEEKDAYS,
  type Weekday,
} from './business-profile';

const SCHEMA_TYPES: Record<string, string> = {
  restaurant: 'Restaurant',
  medical: 'MedicalBusiness',
  dental: 'Dentist',
  legal: 'LegalService',
  accounting: 'AccountingService',
  beauty_salon: 'BeautySalon',
  barbershop: 'HairSalon',
  store: 'Store',
  other: 'LocalBusiness',
};

const SCHEMA_DAYS: Record<Weekday, string> = {
  mon: 'https://schema.org/Monday',
  tue: 'https://schema.org/Tuesday',
  wed: 'https://schema.org/Wednesday',
  thu: 'https://schema.org/Thursday',
  fri: 'https://schema.org/Friday',
  sat: 'https://schema.org/Saturday',
  sun: 'https://schema.org/Sunday',
};

export const JSON_LD_ID = 'lz-ld';

/** schema.org closes at 23:59 for "end of day"; a close before open means past midnight. */
function schemaTime(time: string): string {
  return time === '24:00' ? '23:59' : time;
}

/** Days sharing the same range collapse into one specification. */
function openingHours(
  hours: BusinessProfile['hours'],
): Record<string, unknown>[] {
  if (!hours) return [];
  const byRange = new Map<string, { range: TimeRange; days: string[] }>();
  for (const day of WEEKDAYS) {
    for (const range of hours[day] ?? []) {
      const key = `${range.open}-${range.close}`;
      const entry = byRange.get(key) ?? { range, days: [] };
      entry.days.push(SCHEMA_DAYS[day]);
      byRange.set(key, entry);
    }
  }
  return [...byRange.values()].map(({ range, days }) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: days.length === 1 ? days[0] : days,
    opens: schemaTime(range.open),
    closes: schemaTime(range.close),
  }));
}

/** Null unless the profile has a name and an address or phone (the minimum worth publishing). */
export function buildLocalBusinessJsonLd(
  profile: BusinessProfile,
  url: string,
): Record<string, unknown> | null {
  const a = profile.address;
  const hasAddress = !!(a?.street || a?.city);
  if (!profile.name || !(hasAddress || profile.phone)) return null;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPES[profile.category ?? ''] ?? 'LocalBusiness',
    name: profile.name,
    url,
  };
  if (profile.description) data.description = profile.description;
  if (profile.phone) data.telephone = profile.phone;
  if (profile.email) data.email = profile.email;
  if (profile.logoUrl) {
    data.logo = profile.logoUrl;
    data.image = profile.logoUrl;
  }
  if (profile.priceRange) data.priceRange = profile.priceRange;
  if (hasAddress && a) {
    data.address = {
      '@type': 'PostalAddress',
      ...(a.street ? { streetAddress: a.street } : {}),
      ...(a.city ? { addressLocality: a.city } : {}),
      ...(a.region ? { addressRegion: a.region } : {}),
      ...(a.postalCode ? { postalCode: a.postalCode } : {}),
      addressCountry: a.country ?? 'MX',
    };
  }
  if (profile.geo) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: profile.geo.lat,
      longitude: profile.geo.lng,
    };
  }
  const specs = openingHours(profile.hours);
  if (specs.length > 0) data.openingHoursSpecification = specs;
  const sameAs = Object.values(profile.social ?? {});
  if (sameAs.length > 0) data.sameAs = sameAs.length === 1 ? sameAs[0] : sameAs;
  return data;
}

/** JSON that is inert inside an inline <script>: no tag breakouts, no JS line terminators. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Injects `<script type="application/ld+json" id="lz-ld">` before </head>.
 * The motion runtime's open-now badge also reads it, so it carries the timezone.
 */
export function injectJsonLd(
  html: string,
  data: Record<string, unknown> | null,
  timezone: string | undefined,
): string {
  if (!data || html.includes(`id="${JSON_LD_ID}"`)) return html;
  const tag =
    `<script type="application/ld+json" id="${JSON_LD_ID}" data-lz-tz="${(timezone ?? DEFAULT_TIMEZONE).replace(/[^A-Za-z0-9_+\-/]/g, '')}">` +
    `${serializeJsonLd(data)}</script>`;
  const headClose = html.toLowerCase().indexOf('</head>');
  if (headClose === -1) return html;
  return `${html.slice(0, headClose)}  ${tag}\n${html.slice(headClose)}`;
}
