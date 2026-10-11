/** tenants.business_profile as written by the API (PATCH /tenants/:id/business-profile). */
export interface BusinessProfile {
  name?: string;
  category?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  geo?: { lat: number; lng: number };
  hours?: Partial<Record<Weekday, TimeRange[]>>;
  timezone?: string;
  priceRange?: string;
  social?: Record<string, string>;
  logoUrl?: string;
}

export interface TimeRange {
  open: string;
  close: string;
}

export const WEEKDAYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const DEFAULT_TIMEZONE = 'America/Mexico_City';

const DAY_LABELS: Record<Weekday, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mié',
  thu: 'Jue',
  fri: 'Vie',
  sat: 'Sáb',
  sun: 'Dom',
};

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/;

/** The jsonb column is API-validated, but anything malformed here is dropped rather than trusted. */
export function parseBusinessProfile(raw: unknown): BusinessProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined;
  const obj = (v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : undefined;

  const address = obj(r.address);
  const geo = obj(r.geo);
  const hours = obj(r.hours);
  const social = obj(r.social);

  const profile: BusinessProfile = {
    name: str(r.name),
    category: str(r.category),
    description: str(r.description),
    phone: str(r.phone),
    whatsapp: str(r.whatsapp),
    email: str(r.email),
    timezone: str(r.timezone),
    priceRange: str(r.priceRange),
    logoUrl: httpsUrl(r.logoUrl),
  };
  if (address) {
    profile.address = {
      street: str(address.street),
      city: str(address.city),
      region: str(address.region),
      postalCode: str(address.postalCode),
      country: str(address.country),
    };
  }
  if (
    geo &&
    typeof geo.lat === 'number' &&
    typeof geo.lng === 'number' &&
    Number.isFinite(geo.lat) &&
    Number.isFinite(geo.lng)
  ) {
    profile.geo = { lat: geo.lat, lng: geo.lng };
  }
  if (hours) {
    profile.hours = {};
    for (const day of WEEKDAYS) {
      const ranges = hours[day];
      if (!Array.isArray(ranges)) continue;
      profile.hours[day] = ranges
        .filter(
          (x): x is TimeRange =>
            !!x &&
            typeof x === 'object' &&
            TIME_RE.test(String((x as TimeRange).open)) &&
            TIME_RE.test(String((x as TimeRange).close)),
        )
        .slice(0, 2)
        .map(({ open, close }) => ({ open, close }));
    }
  }
  if (social) {
    profile.social = {};
    for (const [key, value] of Object.entries(social)) {
      const url = httpsUrl(value);
      if (url) profile.social[key] = url;
    }
  }
  return profile;
}

function httpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    return new URL(value).protocol === 'https:' ? value : undefined;
  } catch {
    return undefined;
  }
}

// Mexico City, Guadalajara and Monterrey use 2-digit area codes; the rest of Mexico uses 3.
const MX_TWO_DIGIT_AREAS = new Set(['55', '56', '33', '81']);

/** "55 1234 5678" / "222 123 4567" for Mexican E.164 numbers (the API stores E.164); others as stored. */
export function displayPhone(e164: string | undefined): string {
  if (!e164) return '';
  const digits = e164.replace(/\D/g, '');
  if (!(digits.length === 12 && digits.startsWith('52'))) return e164;
  const n = digits.slice(2);
  return MX_TWO_DIGIT_AREAS.has(n.slice(0, 2))
    ? `${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}`
    : `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

export function telUrl(e164: string | undefined): string {
  return e164 ? `tel:${e164.replace(/[^\d+]/g, '')}` : '';
}

export function whatsappUrl(e164: string | undefined): string {
  const digits = e164?.replace(/\D/g, '') ?? '';
  return digits ? `https://wa.me/${digits}` : '';
}

/** "Av. Reforma 1, CDMX, Ciudad de México 06600" — country omitted. */
export function formatAddress(profile: BusinessProfile): string {
  const a = profile.address;
  if (!a) return '';
  const regionLine = [a.region, a.postalCode].filter(Boolean).join(' ');
  return [a.street, a.city, regionLine].filter(Boolean).join(', ');
}

function displayTime(time: string): string {
  return time.replace(/^0(\d)/, '$1');
}

/** "Lun–Vie 9:00–19:00 · Sáb 10:00–14:00 · Dom cerrado"; days without data are left out. */
export function hoursSummary(profile: BusinessProfile): string {
  const hours = profile.hours;
  if (!hours) return '';
  const groups: { from: Weekday; to: Weekday; label: string }[] = [];
  for (const day of WEEKDAYS) {
    const ranges = hours[day];
    if (ranges === undefined) continue;
    const label =
      ranges.length === 0
        ? 'cerrado'
        : ranges
            .map((r) => `${displayTime(r.open)}–${displayTime(r.close)}`)
            .join(' y ');
    const last = groups[groups.length - 1];
    const prevDay = WEEKDAYS[WEEKDAYS.indexOf(day) - 1];
    if (last && last.label === label && last.to === prevDay) last.to = day;
    else groups.push({ from: day, to: day, label });
  }
  return groups
    .map(({ from, to, label }) => {
      const days =
        from === to
          ? DAY_LABELS[from]
          : `${DAY_LABELS[from]}–${DAY_LABELS[to]}`;
      return `${days} ${label}`;
    })
    .join(' · ');
}
