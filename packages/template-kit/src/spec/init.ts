import { GIROS } from '../../giros';
import { DIRECTIONS } from '../../directions';
import { hueDistance, hueOf, parseColor } from '../lib/color';
import type { Fingerprint } from '../lib/similarity';
import { MIN_ACCENT_HUE_DISTANCE } from '../lib/validate';
import type { ContentObject, ContentValue } from '../types';
import { fontPairPool, palettePool } from './catalog';
import { slug } from './presets';
import { SPEC_VERSION, type Spec, type SpecTier } from './schema';

/** Keys the compiler derives from business and sections; a fresh spec leaves them out. */
const DERIVED = ['links', 'branch', 'branches'];

function strip(
  copy: Record<string, ContentObject>,
): Record<string, ContentObject> {
  const out: Record<string, ContentObject> = {};
  for (const [slot, value] of Object.entries(copy)) {
    const clean: ContentObject = {};
    for (const [k, v] of Object.entries(value))
      if (!DERIVED.includes(k))
        clean[k] = JSON.parse(JSON.stringify(v)) as ContentValue;
    if (Object.keys(clean).length > 0) out[slot] = clean;
  }
  return out;
}

/** Name → `<giro>-<slug>`, without repeating the giro. */
export function idBaseFor(giro: string, nombre: string): string {
  const s = slug(nombre)
    .replace(new RegExp(`^${giro}-?`), '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return `${giro}-${s || 'nueva'}`;
}

/**
 * A ready-to-edit spec for a giro: business data from the flags, the giro's copy, sections by role
 * (the compiler picks variants) and the first palette and font pair still free in the giro.
 */
export function initSpec(opts: {
  giro: string;
  nombre: string;
  tier: SpecTier | 'ambos';
  id?: string;
  library: Fingerprint[];
  /** Art direction (directions/): the compiler picks palette, pair, shape and heroes within it. */
  direction?: string;
}): Spec {
  const giro = GIROS[opts.giro];
  const peers = opts.library.filter((f) => f.vertical === giro.id);
  const hues = peers
    .map((p) => p.accentHue)
    .filter((h): h is number => h !== null);
  // New specs pick from the extended catalog (legacy pools first, then the libraries).
  const palette =
    palettePool(giro, 'extended').find(([, p]) => {
      const c = parseColor(p.colors.accent);
      const h = c ? hueOf(c) : null;
      return (
        !h ||
        h.chroma <= 0.08 ||
        hues.every((x) => hueDistance(x, h.hue) >= MIN_ACCENT_HUE_DISTANCE)
      );
    })?.[0] ?? Object.keys(giro.palettes)[0];
  const fonts = new Set(peers.map((p) => p.fonts));
  const fontPair =
    fontPairPool(giro, 'extended').find((f) => !fonts.has(f)) ??
    giro.fontPairs[0];
  const twin = opts.tier === 'ambos';
  const tiers: SpecTier[] = twin ? ['pro', 'basico'] : [opts.tier as SpecTier];
  const base = idBaseFor(giro.id, opts.nombre);
  const name = base.slice(giro.id.length + 1);
  const id =
    opts.id ??
    (opts.tier === 'basico'
      ? `${giro.id}-base-${name}-v1`
      : `${giro.id}-${name}-v1`);
  // Only images a default section of these tiers shows.
  const used = new Set(
    tiers.flatMap((t) => giro.sections[t]).map((s) => `${s.role}/${s.variant}`),
  );
  const shows = (k: string) =>
    k === 'hero' ||
    (k === 'about' &&
      (used.has('about/text-image-offset') || used.has('about/statement'))) ||
    (k.startsWith('product-') && used.has('catalog/product-grid')) ||
    (k.startsWith('team-') && [...used].some((u) => u.startsWith('team/'))) ||
    (k.startsWith('gallery-') && [...used].some((u) => u.startsWith('proof/')));
  const imageKeys = Object.keys(giro.images).filter(shows);
  return {
    $schema: './spec.schema.json',
    specVersion: SPEC_VERSION,
    ...(twin
      ? { idBase: base, twin: true }
      : { id, tier: opts.tier as SpecTier }),
    giro: giro.id,
    business: {
      name: opts.nombre.trim(),
      shortName:
        opts.nombre.trim().split(/\s+/).length <= 2
          ? opts.nombre.trim()
          : opts.nombre.trim().split(/\s+/)[0],
      tagline: giro.business.tagline,
      city: giro.business.city,
      branch: giro.business.branch,
      address: giro.business.address,
      hours: giro.business.hours,
      phone: giro.business.phone,
      whatsapp: giro.business.whatsapp,
      whatsappMessage: giro.business.whatsappMessage,
    },
    brand: opts.direction
      ? { catalog: 'extended' }
      : {
          catalog: 'extended',
          palette: { preset: palette },
          fontPair,
          shape: giro.shapes[0],
        },
    ...(opts.direction ? { layout: { direction: opts.direction } } : {}),
    sections: Object.fromEntries(
      tiers.map((t) => [t, giro.sections[t].map((s) => ({ role: s.role }))]),
    ),
    copy: { head: { ...giro.head }, ...strip(giro.copy) },
    images: imageKeys.map((key) => ({
      key,
      source: { search: giro.images[key].query },
    })),
    ...(tiers.includes('pro')
      ? {
          motion: {
            preset: opts.direction
              ? DIRECTIONS[opts.direction].motion
              : giro.motion.preset,
            progress: giro.motion.progress,
          },
        }
      : {}),
    todo: [
      'business: dirección, colonia, horario, teléfono y WhatsApp reales (hoy son de demostración)',
      'copy: precios, equipo, reseñas y preguntas del negocio',
      'images: con PIXABAY_API_KEY el build trae las fotos solo; o { "file": "…" } / { "url": "…" }',
      'brand: paleta, tipografía y forma (spec schema → opciones; `kit:spec presets` las lista)',
    ],
  };
}
