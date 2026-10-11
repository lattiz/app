import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {
  type BusinessAddressDto,
  type BusinessHoursDto,
  type BusinessProfileDto,
  type BusinessSocialDto,
  DEFAULT_BUSINESS_TIMEZONE,
  WEEKDAYS,
} from './dto/business-profile.dto';
import { InvalidBusinessProfileException } from './tenants.exceptions';

type Patch = Record<string, unknown>;

/**
 * Turns a validated PATCH body into a jsonb patch: trimmed values, phones in
 * E.164, and `null` for every key the caller cleared. Keys the caller omitted
 * stay absent so `business_profile || patch` leaves them untouched.
 */
export function businessProfilePatch(dto: BusinessProfileDto): Patch {
  const patch: Patch = {};
  const set = (key: keyof BusinessProfileDto, value: unknown) => {
    if (dto[key] !== undefined) patch[key] = value ?? null;
  };

  set('name', text(dto.name));
  set('category', dto.category);
  set('description', text(dto.description));
  set('phone', phone(dto.phone, 'phone'));
  set('whatsapp', phone(dto.whatsapp, 'whatsapp'));
  set('email', text(dto.email)?.toLowerCase());
  set('address', address(dto.address));
  set('geo', dto.geo ? { lat: dto.geo.lat, lng: dto.geo.lng } : null);
  set('hours', hours(dto.hours));
  set('timezone', text(dto.timezone));
  set('priceRange', dto.priceRange);
  set('social', social(dto.social));
  set('logoUrl', text(dto.logoUrl));
  return patch;
}

/** The stored document as the API returns it (timezone defaulted). */
export function readBusinessProfile(stored: unknown): BusinessProfileDto {
  const profile =
    stored && typeof stored === 'object' && !Array.isArray(stored)
      ? (stored as BusinessProfileDto)
      : {};
  return {
    ...profile,
    timezone: profile.timezone ?? DEFAULT_BUSINESS_TIMEZONE,
  };
}

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Mexico is assumed when the number carries no country code. */
function phone(
  value: string | null | undefined,
  field: 'phone' | 'whatsapp',
): string | null {
  const raw = text(value);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  // Pre-2019 Mexican mobile format (+52 1 + 10 digits), still common for WhatsApp.
  const candidates =
    digits.length === 13 && digits.startsWith('521')
      ? [raw, `+52${digits.slice(3)}`]
      : [raw];
  for (const candidate of candidates) {
    const parsed = parsePhoneNumberFromString(candidate, 'MX');
    if (parsed?.isValid()) return parsed.number;
  }
  throw new InvalidBusinessProfileException(field);
}

function address(value: BusinessAddressDto | null | undefined): Patch | null {
  if (!value) return null;
  return compact({
    street: text(value.street),
    city: text(value.city),
    region: text(value.region),
    postalCode: text(value.postalCode),
    country: text(value.country)?.toUpperCase() ?? null,
  });
}

function hours(value: BusinessHoursDto | null | undefined): Patch | null {
  if (!value) return null;
  const out: Patch = {};
  for (const day of WEEKDAYS) {
    const ranges = value[day];
    if (ranges === undefined) continue;
    for (const range of ranges) {
      if (range.open === range.close) {
        throw new InvalidBusinessProfileException('hours');
      }
    }
    out[day] = ranges.map(({ open, close }) => ({ open, close }));
  }
  return Object.keys(out).length > 0 ? out : null;
}

function social(value: BusinessSocialDto | null | undefined): Patch | null {
  if (!value) return null;
  return compact({
    instagram: text(value.instagram),
    facebook: text(value.facebook),
    tiktok: text(value.tiktok),
    youtube: text(value.youtube),
    x: text(value.x),
    linkedin: text(value.linkedin),
    googleMaps: text(value.googleMaps),
  });
}

function compact(record: Record<string, string | null>): Patch | null {
  const entries = Object.entries(record).filter(([, v]) => v !== null);
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}
