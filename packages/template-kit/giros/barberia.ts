import norte from '../content/barberia.norte.es-MX';
import oxido from '../content/barberia.oxido.es-MX';
import trazo from '../content/barberia.trazo.es-MX';
import { loadTheme } from '../src/lib/load';
import type { GiroDefinition } from '../src/spec/giro';
import { palette, type GiroPalette } from '../src/spec/presets';
import type { ContentObject } from '../src/types';

/**
 * Barbería, derived from the hand-made templates: their six themes are the first palettes (all
 * taken, so a new barbería falls through to the free ones below), Norte's copy is the Pro voice
 * and Trazo's fills the Basic-only keys.
 */

const THEMES = [
  'oxido',
  'norte-atelier',
  'concreto-brutal',
  'trazo-noche',
  'trazo-papel',
  'trazo-solar',
] as const;

function fromTheme(name: string): GiroPalette {
  const t = loadTheme(name);
  return {
    label: t.label,
    scheme: ['oxido', 'trazo-noche'].includes(name) ? 'dark' : 'light',
    colors: t.colors,
    accentWords: t.accentWords,
    photoTreatment: t.photoTreatment,
    placeholder: t.placeholder,
    effects: t.effects,
  };
}

const sections = (pack: { sections: Record<string, ContentObject> }) =>
  pack.sections;

export default {
  id: 'barberia',
  label: 'Barbería',
  category: 'barberias',
  businessCategory: 'barbershop',
  schemaType: 'BarberShop',
  description: {
    pro: 'Barbería con identidad propia: carta de servicios, galería, equipo, reseñas, preguntas y contacto',
    basico:
      'Barbería de barrio: precios claros, preguntas frecuentes y ubicación',
  },
  palettes: {
    ...Object.fromEntries(THEMES.map((name) => [name, fromTheme(name)])),
    petroleo: palette({
      label: 'Petróleo (oscuro, acento turquesa)',
      scheme: 'dark',
      bg: '#0D1517',
      surface: '#132024',
      surface2: '#1B2B30',
      text: '#E8F1F2',
      muted: '#9FB3B7',
      accent: '#2EC4C9',
      onAccent: '#0D1517',
      accentText: '#4FD2D6',
      photoTreatment: 'grayscale',
      placeholder: 'grain',
    }),
    uva: palette({
      label: 'Uva (claro, acento morado)',
      scheme: 'light',
      bg: '#F5F1F4',
      surface: '#FCFAFB',
      surface2: '#E9E0E6',
      text: '#1F1420',
      muted: '#5E4F5D',
      accent: '#9A2BA6',
      onAccent: '#FFFFFF',
      accentText: '#9A2BA6',
      overlay: 'bg',
      photoTreatment: 'none',
      placeholder: 'dots',
    }),
    hoja: palette({
      label: 'Hoja (oscuro, acento verde hoja)',
      scheme: 'dark',
      bg: '#101412',
      surface: '#171D1A',
      surface2: '#1F2824',
      text: '#ECF3EE',
      muted: '#A2B2A8',
      accent: '#62C95A',
      onAccent: '#101412',
      accentText: '#78D46F',
      photoTreatment: 'duotone',
      placeholder: 'stripes',
    }),
  },
  fontPairs: [
    'anton+space-grotesk',
    'playfair-display+inter',
    'archivo-black+space-grotesk',
    'dm-serif-display+dm-sans',
    'fraunces+nunito-sans',
    'unbounded+manrope',
    'bricolage-grotesque+inter',
    'syne+karla',
    'young-serif+figtree',
  ],
  shapes: ['urbano', 'filete', 'brutal', 'sutil', 'suave', 'redondo'],
  sections: {
    pro: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'image-bg' },
      { role: 'marquee', variant: 'ticker' },
      { role: 'about', variant: 'text-image-offset' },
      { role: 'catalog', variant: 'price-list' },
      { role: 'proof', variant: 'grid' },
      { role: 'contact', variant: 'with-contact' },
      { role: 'team', variant: 'grid' },
      { role: 'testimonials', variant: 'cards' },
      { role: 'faq', variant: 'list' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'big-wordmark' },
    ],
    basico: [
      { role: 'header', variant: 'inline' },
      { role: 'hero', variant: 'centered-arch' },
      { role: 'about', variant: 'brief' },
      { role: 'catalog', variant: 'price-list' },
      { role: 'faq', variant: 'list' },
      { role: 'contact', variant: 'single' },
      { role: 'whatsapp', variant: 'bubble' },
      { role: 'footer', variant: 'columns' },
    ],
  },
  motion: { preset: 'editorial', progress: true },
  navLabels: {
    about: 'Nosotros',
    services: 'Servicios',
    team: 'Barberos',
    gallery: 'Trabajo',
    testimonials: 'Reseñas',
    faq: 'Preguntas',
    locations: 'Visítanos',
  },
  business: {
    tagline: 'Barbería de autor',
    whatsappMessage: 'Hola, me gustaría reservar una cita',
    phone: '+52 55 0000 0000',
    whatsapp: '5215500000000',
    city: 'CDMX',
    hours: 'Mar–Sáb 10:00–20:00 · Dom 11:00–16:00',
    address: 'Colima 145, Roma Norte, Cuauhtémoc, CDMX',
    branch: 'Roma Norte',
  },
  head: norte.head,
  copy: {
    ...sections(trazo),
    ...sections(norte),
    marquee: oxido.sections.marquee,
    about: {
      ...trazo.sections.about,
      ...norte.sections.about,
      stats: oxido.sections.about.stats,
    },
    locations: { ...trazo.sections.locations, ...norte.sections.locations },
  },
  heroAlternates: [
    'Cortes con <span class="lz-title__serif">calma</span> y oficio.',
    'Tu barbería de <span class="lz-title__serif">confianza</span> en {{city}}.',
    'Sal con el corte que <span class="lz-title__serif">pediste</span>.',
  ],
  images: {
    hero: { query: 'barber cutting hair', orientation: 'landscape' },
    about: { query: 'barber tools scissors comb', orientation: 'portrait' },
    'team-1': { query: 'barber portrait', orientation: 'portrait' },
    'team-2': { query: 'barber portrait smiling', orientation: 'portrait' },
    'team-3': { query: 'hairdresser portrait', orientation: 'portrait' },
    'team-4': { query: 'barber shop worker portrait', orientation: 'portrait' },
    'gallery-01': { query: 'men haircut fade', orientation: 'square' },
    'gallery-02': { query: 'straight razor shave', orientation: 'square' },
    'gallery-03': { query: 'textured haircut men', orientation: 'square' },
    'gallery-04': { query: 'beard trim', orientation: 'square' },
    'gallery-05': { query: 'barber shop interior', orientation: 'square' },
    'gallery-06': { query: 'long hair scissors cut', orientation: 'square' },
    'gallery-07': { query: 'barber tools', orientation: 'square' },
    'gallery-08': { query: 'low taper fade', orientation: 'square' },
  },
  demoHours: {
    tue: [{ open: '10:00', close: '20:00' }],
    wed: [{ open: '10:00', close: '20:00' }],
    thu: [{ open: '10:00', close: '20:00' }],
    fri: [{ open: '10:00', close: '20:00' }],
    sat: [{ open: '10:00', close: '20:00' }],
    sun: [{ open: '11:00', close: '16:00' }],
  },
  priceRange: '$$',
} satisfies GiroDefinition;
