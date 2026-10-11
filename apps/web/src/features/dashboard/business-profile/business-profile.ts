import type {
  BusinessHoursDto,
  BusinessProfileDto,
  TimeRangeDto,
} from '@lattiz/api-client';
import { z } from 'zod';

export const CATEGORY_LABELS = {
  restaurant: 'Restaurante',
  medical: 'Consultorio médico',
  dental: 'Dentista',
  legal: 'Despacho legal',
  accounting: 'Contabilidad',
  beauty_salon: 'Salón de belleza',
  barbershop: 'Barbería',
  store: 'Tienda',
  other: 'Otro',
} as const satisfies Record<
  NonNullable<BusinessProfileDto['category']>,
  string
>;

export const PRICE_RANGE_LABELS = {
  $: '$ · Económico',
  $$: '$$ · Moderado',
  $$$: '$$$ · Alto',
  $$$$: '$$$$ · Premium',
} as const satisfies Record<
  NonNullable<BusinessProfileDto['priceRange']>,
  string
>;

export const TIMEZONE_LABELS: Record<string, string> = {
  'America/Mexico_City': 'Centro (CDMX, Guadalajara, Monterrey)',
  'America/Cancun': 'Sureste (Quintana Roo)',
  'America/Chihuahua': 'Chihuahua',
  'America/Mazatlan': 'Pacífico (Sinaloa, Nayarit, BCS)',
  'America/Hermosillo': 'Sonora',
  'America/Tijuana': 'Noroeste (Baja California)',
};

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

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

/** Mirrors the {{lz:*}} tokens tenant-sites replaces at serve time. */
export const SITE_TOKENS: { token: string; description: string }[] = [
  { token: '{{lz:name}}', description: 'Nombre del negocio' },
  { token: '{{lz:phone}}', description: 'Teléfono (55 1234 5678)' },
  { token: '{{lz:phone_tel}}', description: 'Enlace para llamar (tel:)' },
  { token: '{{lz:whatsapp_url}}', description: 'Enlace a WhatsApp (wa.me)' },
  { token: '{{lz:email}}', description: 'Correo' },
  { token: '{{lz:address}}', description: 'Dirección completa' },
  { token: '{{lz:city}}', description: 'Ciudad' },
  { token: '{{lz:hours_summary}}', description: 'Horario resumido' },
];

export type HoursState = Record<Weekday, TimeRangeDto[]>;

export const DEFAULT_HOURS: HoursState = {
  mon: [{ open: '09:00', close: '19:00' }],
  tue: [{ open: '09:00', close: '19:00' }],
  wed: [{ open: '09:00', close: '19:00' }],
  thu: [{ open: '09:00', close: '19:00' }],
  fri: [{ open: '09:00', close: '19:00' }],
  sat: [{ open: '10:00', close: '14:00' }],
  sun: [],
};

export function hoursFromProfile(
  hours: BusinessHoursDto | null | undefined,
): HoursState | null {
  if (!hours) return null;
  return Object.fromEntries(
    WEEKDAYS.map((day) => [day, (hours[day] ?? []).map((r) => ({ ...r }))]),
  ) as HoursState;
}

/** Flat form state: every field a string so inputs stay controlled. */
export interface ProfileForm {
  name: string;
  category: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: string;
  lng: string;
  timezone: string;
  priceRange: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  googleMaps: string;
  logoUrl: string;
}

export function formFromProfile(p: BusinessProfileDto): ProfileForm {
  return {
    name: p.name ?? '',
    category: p.category ?? '',
    description: p.description ?? '',
    phone: p.phone ?? '',
    whatsapp: p.whatsapp ?? '',
    email: p.email ?? '',
    street: p.address?.street ?? '',
    city: p.address?.city ?? '',
    region: p.address?.region ?? '',
    postalCode: p.address?.postalCode ?? '',
    country: p.address?.country ?? 'MX',
    lat: p.geo ? String(p.geo.lat) : '',
    lng: p.geo ? String(p.geo.lng) : '',
    timezone: p.timezone ?? 'America/Mexico_City',
    priceRange: p.priceRange ?? '',
    instagram: p.social?.instagram ?? '',
    facebook: p.social?.facebook ?? '',
    tiktok: p.social?.tiktok ?? '',
    youtube: p.social?.youtube ?? '',
    googleMaps: p.social?.googleMaps ?? '',
    logoUrl: p.logoUrl ?? '',
  };
}

const optionalHttps = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^https:\/\/[^\s]+\.[^\s]+/.test(v),
    'Usa una dirección que empiece con https://',
  );

const coordinate = (max: number) =>
  z
    .string()
    .trim()
    .refine(
      (v) =>
        v === '' || (Number.isFinite(Number(v)) && Math.abs(Number(v)) <= max),
      'Coordenada no válida',
    );

export const ProfileFormSchema = z
  .object({
    name: z.string().trim().max(100, 'Máximo 100 caracteres'),
    description: z.string().trim().max(500, 'Máximo 500 caracteres'),
    phone: z.string().trim().max(32),
    whatsapp: z.string().trim().max(32),
    email: z
      .string()
      .trim()
      .refine(
        (v) => v === '' || z.email().safeParse(v).success,
        'Correo no válido',
      ),
    postalCode: z.string().trim().max(12, 'Máximo 12 caracteres'),
    country: z
      .string()
      .trim()
      .refine(
        (v) => v === '' || /^[A-Za-z]{2}$/.test(v),
        'Usa el código de 2 letras (MX)',
      ),
    lat: coordinate(90),
    lng: coordinate(180),
    instagram: optionalHttps,
    facebook: optionalHttps,
    tiktok: optionalHttps,
    youtube: optionalHttps,
    googleMaps: optionalHttps,
    logoUrl: optionalHttps,
  })
  .refine((v) => (v.lat === '') === (v.lng === ''), {
    message: 'Escribe latitud y longitud, o deja ambas vacías',
    path: ['lng'],
  });

export type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

export function validateForm(form: ProfileForm): ProfileFormErrors {
  const result = ProfileFormSchema.safeParse(form);
  if (result.success) return {};
  const errors: ProfileFormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ProfileForm;
    errors[key] ??= issue.message;
  }
  return errors;
}

export function hoursError(hours: HoursState | null): string | null {
  if (!hours) return null;
  for (const day of WEEKDAYS) {
    for (const range of hours[day]) {
      if (!range.open || !range.close)
        return `Completa el horario del ${WEEKDAY_LABELS[day].toLowerCase()}.`;
      if (range.open === range.close)
        return `El ${WEEKDAY_LABELS[day].toLowerCase()} abre y cierra a la misma hora.`;
    }
  }
  return null;
}

/** The PATCH body: every key sent, "" clears it, nested objects replaced whole. */
export function bodyFromForm(
  form: ProfileForm,
  hours: HoursState | null,
): BusinessProfileDto {
  const lat = form.lat.trim();
  const lng = form.lng.trim();
  return {
    name: form.name,
    category: (form.category || null) as BusinessProfileDto['category'],
    description: form.description,
    phone: form.phone,
    whatsapp: form.whatsapp,
    email: form.email,
    address: {
      street: form.street,
      city: form.city,
      region: form.region,
      postalCode: form.postalCode,
      country: form.country,
    },
    geo: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
    hours,
    timezone: form.timezone,
    priceRange: (form.priceRange || null) as BusinessProfileDto['priceRange'],
    social: {
      instagram: form.instagram,
      facebook: form.facebook,
      tiktok: form.tiktok,
      youtube: form.youtube,
      googleMaps: form.googleMaps,
    },
    logoUrl: form.logoUrl,
  };
}
