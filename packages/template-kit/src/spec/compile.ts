import { createHash } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { GIROS } from '../../giros';
import { hueDistance, hueOf, parseColor } from '../lib/color';
import { interpolate, mapsEmbedUrl, mapsLinkUrl } from '../lib/content';
import { loadBlueprint } from '../lib/load';
import { paths } from '../lib/paths';
import { streetOf } from '../lib/profile';
import {
  fingerprint,
  normalizeHeadline,
  similarity,
  type Fingerprint,
} from '../lib/similarity';
import { MIN_ACCENT_HUE_DISTANCE } from '../lib/validate';
import { TIERS, type Role, type Tier } from '../tiers';
import type {
  Blueprint,
  Business,
  ContentObject,
  ContentPack,
  ContentValue,
  Manifest,
  ManifestMotion,
  ManifestSection,
  Theme,
} from '../types';
import type { DemoHours, GiroDefinition } from './giro';
import {
  FONT_PAIRS,
  SHAPES,
  type FontPairPreset,
  type GiroPalette,
  type ShapePreset,
} from './presets';
import type { Spec, SpecBrand, SpecProblem, SpecTier } from './schema';
import { composeTheme, customPalette, resolveFontPair } from './theme';

/**
 * Spec → in-memory manifest(s), theme(s), copy pack and demo profile(s). Uniqueness inside the giro
 * is enforced here, before anything is compiled: palette, font pair, hero variant and headline are
 * picked so kit:validate's rules hold by construction.
 */

/** Bumped when the generator's output changes for the same spec. */
export const GENERATOR_VERSION = 2;

export const KIT_TIER: Record<SpecTier, Tier> = { pro: 'pro', basico: 'basic' };
export const TIER_LABEL: Record<SpecTier, string> = {
  pro: 'Pro',
  basico: 'Básico',
};

/** Page anchors per slot (fixed in each variant's section.html). */
const ANCHORS: Record<string, string> = {
  about: 'nosotros',
  services: 'servicios',
  team: 'equipo',
  gallery: 'galeria',
  testimonials: 'resenas',
  faq: 'preguntas',
};
const anchorOf = (slot: string, variant: string) =>
  slot === 'locations'
    ? variant === 'single'
      ? 'ubicacion'
      : 'sucursales'
    : ANCHORS[slot];
/** Menu priority: up to five links, then shown in page order. */
const NAV_PRIORITY = [
  'about',
  'services',
  'team',
  'faq',
  'locations',
  'gallery',
  'testimonials',
];
/** Slots the similarity pass may swap when the spec doesn't pin them, most visible first. */
const SWAPPABLE = [
  'services',
  'about',
  'footer',
  'navbar',
  'team',
  'testimonials',
  'gallery',
  'faq',
];

export function canonicalJson(value: unknown): string {
  const sort = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(sort)
      : v && typeof v === 'object'
        ? Object.fromEntries(
            Object.keys(v as object)
              .sort()
              .map((k) => [k, sort((v as Record<string, unknown>)[k])]),
          )
        : v;
  return JSON.stringify(sort(value));
}

export const shortHash = (text: string) =>
  createHash('sha256').update(text).digest('hex').slice(0, 12);

export function specHash(spec: Spec): string {
  const { $schema: _schema, todo: _todo, ...rest } = spec;
  void _schema;
  void _todo;
  return shortHash(`${GENERATOR_VERSION}:${canonicalJson(rest)}`);
}

function seedOf(text: string): number {
  return parseInt(shortHash(text).slice(0, 8), 16);
}

function rotate<T>(items: readonly T[], seed: number): T[] {
  if (items.length === 0) return [];
  const k = seed % items.length;
  return [...items.slice(k), ...items.slice(0, k)];
}

function isObject(v: unknown): v is ContentObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Objects merge key by key; arrays and scalars replace. */
export function deepMerge(
  base: ContentObject,
  patch: ContentObject,
): ContentObject {
  const out: ContentObject = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] =
      isObject(v) && isObject(out[k])
        ? deepMerge(out[k] as ContentObject, v)
        : v;
  }
  return out;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** `{{branch}}` is the spec's own placeholder (the kit has no such variable): replaced at generation. */
function fillBranch<T extends ContentValue>(value: T, branch: string): T {
  if (typeof value === 'string')
    return value.replaceAll('{{branch}}', branch) as T;
  if (Array.isArray(value)) return value.map((v) => fillBranch(v, branch)) as T;
  if (isObject(value))
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fillBranch(v, branch)]),
    ) as T;
  return value;
}

function branchName(spec: Spec, giro: GiroDefinition): string {
  return (
    spec.business.branch ??
    spec.business.branches?.[0]?.name ??
    giro.business.branch
  );
}

// ── Ids and file names ──────────────────────────────────────────────────────

export interface SpecTarget {
  tier: SpecTier;
  id: string;
}

export function specTargets(spec: Spec): SpecTarget[] {
  if (spec.id)
    return [{ tier: spec.tier === 'basico' ? 'basico' : 'pro', id: spec.id }];
  const base = spec.idBase as string;
  const name = base.startsWith(`${spec.giro}-`)
    ? base.slice(spec.giro.length + 1)
    : base;
  return [
    { tier: 'pro', id: `${spec.giro}-${name}-v1` },
    { tier: 'basico', id: `${spec.giro}-base-${name}-v1` },
  ];
}

/** `specs/<stem>.spec.json`: the id (one tier) or the idBase (twin). */
export function specStem(spec: Spec): string {
  return (spec.id ?? spec.idBase) as string;
}

export function contentName(spec: Spec): string {
  const stem = specStem(spec);
  const voice = stem.startsWith(`${spec.giro}-`)
    ? stem.slice(spec.giro.length + 1)
    : stem;
  return `${spec.giro}.${voice}.es-MX`;
}

// ── Library fingerprints ────────────────────────────────────────────────────

export interface Peer extends Fingerprint {
  /** Generated by this build (a twin sibling). */
  sibling?: boolean;
}

// ── Resolution ──────────────────────────────────────────────────────────────

export interface ResolvedSection {
  role: Role;
  slot: string;
  variant: string;
  pinned: boolean;
}

export interface TierPlan {
  tier: SpecTier;
  id: string;
  manifest: Manifest;
  theme: Theme;
  demoProfile: Record<string, unknown>;
  /** What the uniqueness pass chose and why (Spanish, for the build report). */
  choices: string[];
  fingerprint: Fingerprint;
  imageKeys: string[];
}

export interface SpecPlan {
  spec: Spec;
  giro: GiroDefinition;
  hash: string;
  contentName: string;
  pack: ContentPack;
  tiers: TierPlan[];
  problems: SpecProblem[];
}

function sectionsFor(
  spec: Spec,
  giro: GiroDefinition,
  tier: SpecTier,
  blueprint: Blueprint,
): ResolvedSection[] {
  const slots = blueprint.verticals[giro.id]?.slots ?? {};
  const defaults = giro.sections[tier];
  const entries: { role: Role; slot?: string; variant?: string }[] =
    spec.sections?.[tier] ?? defaults.map((d) => ({ role: d.role }));
  return entries.map((entry) => {
    const slot = slots[entry.role] ?? entry.slot ?? entry.role;
    const pinned = typeof entry.variant === 'string';
    const variant =
      entry.variant ??
      defaults.find((d) => d.role === entry.role)?.variant ??
      allowedVariants(blueprint, entry.role, slot)[0];
    return { role: entry.role, slot, variant, pinned };
  });
}

export function allowedVariants(
  blueprint: Blueprint,
  role: Role,
  slot: string,
): string[] {
  const listed = blueprint.roles[role]?.variants;
  if (listed) return listed;
  const dir = resolve(paths.sections, slot);
  return existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];
}

function accentHue(p: GiroPalette): number | null {
  const accent = parseColor(p.colors.accent);
  if (!accent) return null;
  const h = hueOf(accent);
  return h.chroma > 0.08 ? h.hue : null;
}

function brandFor(spec: Spec, tier: SpecTier): SpecBrand {
  return { ...(spec.brand ?? {}), ...(spec.overrides?.[tier]?.brand ?? {}) };
}

/** True when the spec chose this brand field for this tier (twin Básico inherits only via overrides). */
function pinnedBrand(
  spec: Spec,
  tier: SpecTier,
  key: keyof SpecBrand,
  twin: boolean,
): boolean {
  if (spec.overrides?.[tier]?.brand?.[key] !== undefined) return true;
  if (twin && tier === 'basico') return false;
  return spec.brand?.[key] !== undefined;
}

function businessOf(spec: Spec, giro: GiroDefinition): Business {
  const b = spec.business;
  const city = b.city ?? giro.business.city;
  const q = `${b.name} ${b.branch ?? city}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '+')
    .replace(/^\+|\+$/g, '');
  const domain = b.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
  return {
    name: b.name,
    shortName: b.shortName ?? b.name,
    tagline: b.tagline ?? giro.business.tagline,
    city,
    phone: b.phone ?? giro.business.phone,
    whatsapp: b.whatsapp ?? giro.business.whatsapp,
    whatsappMessage: b.whatsappMessage ?? giro.business.whatsappMessage,
    address: b.address ?? giro.business.address,
    year: b.year ?? '2026',
    instagramUrl: b.instagramUrl ?? 'https://instagram.com',
    tiktokUrl: b.tiktokUrl ?? 'https://tiktok.com',
    facebookUrl: b.facebookUrl ?? 'https://facebook.com',
    email: b.email ?? `hola@${domain || 'negocio'}.mx`,
    googleReviewsUrl:
      b.googleReviewsUrl ?? `https://www.google.com/search?q=${q}`,
    googleReviewUrl:
      b.googleReviewUrl ??
      `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}

interface BranchCard {
  name: string;
  address: string;
  hours: string;
  directionsUrl: string;
  mapUrl: string;
  mapTitle: string;
}

function branchesOf(spec: Spec, giro: GiroDefinition) {
  const list = spec.business.branches ?? [
    {
      name: spec.business.branch ?? giro.business.branch,
      address: '{{address}}',
      hours: spec.business.hours ?? giro.business.hours,
    } as NonNullable<Spec['business']['branches']>[number],
  ];
  const cards: BranchCard[] = list.map((b) => {
    // The business address stays a variable: adopted sites point the map at their own address.
    const own = !b.mapsQuery && b.address === '{{address}}';
    const query = b.mapsQuery ?? b.address;
    return {
      name: b.name,
      address: b.address,
      hours: b.hours,
      directionsUrl: own
        ? 'https://maps.google.com/?q={{address}}'
        : mapsLinkUrl(query),
      mapUrl: own
        ? 'https://www.google.com/maps?q={{address}}&output=embed'
        : mapsEmbedUrl(query),
      mapTitle: `Mapa de la sucursal ${b.name}`,
    };
  });
  const footer = list.map((b) => ({
    name: b.name,
    address: b.shortAddress ?? b.address,
    hours: b.hours,
  }));
  return { cards, footer };
}

/** Links to the sections present, labels from the giro (or the spec's own links, filtered per tier). */
function navLinks(
  sections: ResolvedSection[],
  giro: GiroDefinition,
  explicit: ContentValue | undefined,
): { label: string; href: string }[] {
  const present = new Map(
    sections
      .map((s) => [s.slot, anchorOf(s.slot, s.variant)] as const)
      .filter((e): e is readonly [string, string] => Boolean(e[1])),
  );
  const anchors = new Set(present.values());
  if (Array.isArray(explicit)) {
    return explicit
      .filter(isObject)
      .map((l) => {
        const href = String(l.href ?? '');
        // A link to the other tier's contact block points at this tier's.
        const fixed =
          href === '#sucursales' && anchors.has('ubicacion')
            ? '#ubicacion'
            : href === '#ubicacion' && anchors.has('sucursales')
              ? '#sucursales'
              : href;
        return { label: String(l.label ?? ''), href: fixed };
      })
      .filter((l) => !l.href.startsWith('#') || anchors.has(l.href.slice(1)));
  }
  const order = sections.map((s) => s.slot);
  return NAV_PRIORITY.filter((slot) => present.has(slot))
    .slice(0, 5)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((slot) => ({
      label: giro.navLabels[slot] ?? slot,
      href: `#${present.get(slot)}`,
    }));
}

/** Copy for one tier: giro skeleton ← spec ← tier override, plus links and branches for its sections. */
function tierCopy(
  spec: Spec,
  giro: GiroDefinition,
  tier: SpecTier,
  sections: ResolvedSection[],
  branches: ReturnType<typeof branchesOf>,
): Record<string, ContentObject> {
  const merged: Record<string, ContentObject> = {};
  const slots = new Set([
    ...Object.keys(giro.copy),
    ...Object.keys(spec.copy ?? {}),
    ...Object.keys(spec.overrides?.[tier]?.copy ?? {}),
  ]);
  for (const slot of slots) {
    if (slot === 'head') continue;
    let value: ContentObject = clone(giro.copy[slot] ?? {});
    if (spec.copy?.[slot])
      value = deepMerge(value, spec.copy[slot] as ContentObject);
    const over = spec.overrides?.[tier]?.copy?.[slot];
    if (over) value = deepMerge(value, over as ContentObject);
    delete value.alternates;
    merged[slot] = fillBranch(value, branchName(spec, giro));
  }
  for (const img of spec.images ?? []) {
    if (!img.alt) continue;
    const m = /^(team|gallery)-0?(\d)$/.exec(img.key);
    if (img.key === 'hero' && merged.hero) merged.hero.imageAlt = img.alt;
    else if (img.key === 'about' && merged.about)
      merged.about.imageAlt = img.alt;
    else if (m) {
      const list = merged[m[1]]?.[m[1] === 'team' ? 'members' : 'items'];
      const item = Array.isArray(list) ? list[Number(m[2]) - 1] : undefined;
      if (isObject(item)) item[m[1] === 'team' ? 'imageAlt' : 'alt'] = img.alt;
    }
  }
  const links = navLinks(sections, giro, merged.navbar?.links);
  const footerLinks = merged.footer?.links
    ? navLinks(sections, giro, merged.footer.links)
    : links;
  merged.navbar = { ...merged.navbar, links };
  const single = sections.some(
    (s) => s.slot === 'locations' && s.variant === 'single',
  );
  const {
    branch: _branch,
    branches: _branches,
    ...locations
  } = merged.locations ?? {};
  void _branch;
  void _branches;
  merged.locations = {
    ...locations,
    ...(single
      ? { branch: { ...branches.cards[0] } }
      : { branches: branches.cards.map((c) => ({ ...c })) }),
  };
  merged.footer = {
    ...merged.footer,
    links: footerLinks,
    branches: (single ? branches.footer.slice(0, 1) : branches.footer).map(
      (b) => ({ ...b }),
    ),
  };
  return merged;
}

function headOf(spec: Spec, giro: GiroDefinition, tier?: SpecTier) {
  const head = {
    ...giro.head,
    ...((spec.copy?.head ?? {}) as Partial<typeof giro.head>),
  };
  if (tier)
    Object.assign(
      head,
      (spec.overrides?.[tier]?.copy?.head ?? {}) as Partial<typeof giro.head>,
    );
  return fillBranch(
    { title: String(head.title), description: String(head.description) },
    branchName(spec, giro),
  );
}

function demoProfileOf(
  spec: Spec,
  giro: GiroDefinition,
  business: Business,
): Record<string, unknown> {
  const hours: DemoHours = giro.demoHours;
  const base: Record<string, unknown> = {
    name: business.name,
    category: giro.businessCategory,
    phone: business.phone.replace(/[^\d+]/g, ''),
    whatsapp: `+${business.whatsapp}`,
    email: business.email,
    address: { street: streetOf(business), city: business.city, country: 'MX' },
    hours,
    timezone: 'America/Mexico_City',
    priceRange: giro.priceRange,
    social: {
      instagram: business.instagramUrl,
      facebook: business.facebookUrl,
    },
  };
  return { ...base, ...(spec.demoProfile ?? {}) };
}

interface Pick<T> {
  id: string;
  value: T;
  pinned: boolean;
}

function candidates<T>(
  pinned: Pick<T> | undefined,
  pool: Pick<T>[],
  seed: number,
): Pick<T>[] {
  const rest = rotate(
    pool.filter((p) => p.id !== pinned?.id),
    seed,
  );
  return pinned ? [pinned, ...rest] : rest;
}

function headlineOf(html: string, business: Business): string {
  try {
    return interpolate(html, { business, source: 'spec (hero title)' });
  } catch {
    return html;
  }
}

/**
 * Resolves the whole spec. Peers are the library's fingerprints for this giro, without the ids this
 * spec generates. Returns problems instead of throwing.
 */
export async function planSpec(
  spec: Spec,
  library: Fingerprint[],
): Promise<SpecPlan | { problems: SpecProblem[] }> {
  const giro = GIROS[spec.giro];
  if (!giro)
    return {
      problems: [
        {
          level: 'error',
          path: 'giro',
          message: `giro desconocido: "${spec.giro}"`,
          hint: `Giros: ${Object.keys(GIROS).join(', ')}`,
        },
      ],
    };
  const problems: SpecProblem[] = [];
  const targets = specTargets(spec);
  const twin = targets.length === 2;
  const ownIds = new Set(targets.map((t) => t.id));
  const peers: Peer[] = library.filter(
    (f) => f.vertical === giro.id && !ownIds.has(f.id),
  );
  const business = businessOf(spec, giro);
  const branches = branchesOf(spec, giro);
  const tiers: TierPlan[] = [];
  const copies = new Map<SpecTier, Record<string, ContentObject>>();

  for (const { tier, id } of targets) {
    const kitTier = KIT_TIER[tier];
    const blueprint = await loadBlueprint('service-landing', kitTier);
    const brand = brandFor(spec, tier);
    const seed = seedOf(id);
    const choices: string[] = [];
    const sections = sectionsFor(spec, giro, tier, blueprint);

    // Palette: accent hue ≥ 30° from every template of the giro.
    const custom =
      brand.palette &&
      'custom' in brand.palette &&
      pinnedBrand(spec, tier, 'palette', twin)
        ? brand.palette.custom
        : undefined;
    let palettePick: Pick<GiroPalette> | undefined;
    if (custom) {
      const derived = customPalette(custom);
      if (!derived.palette) {
        problems.push({
          level: 'error',
          path: `${pinnedBrand(spec, tier, 'palette', twin) && spec.overrides?.[tier]?.brand?.palette ? `overrides.${tier}.` : ''}brand.palette.custom`,
          message: `la paleta propia no cumple AA: ${derived.problems.join('; ')}`,
          hint: `Ajusta los colores o usa una curada: ${Object.keys(giro.palettes).join(', ')}`,
        });
        continue;
      }
      palettePick = { id: 'custom', value: derived.palette, pinned: true };
    }
    const presetId =
      brand.palette && 'preset' in brand.palette
        ? brand.palette.preset
        : undefined;
    const pinnedPalette =
      palettePick ??
      (presetId &&
      giro.palettes[presetId] &&
      pinnedBrand(spec, tier, 'palette', twin)
        ? { id: presetId, value: giro.palettes[presetId], pinned: true }
        : undefined);
    if (presetId && !giro.palettes[presetId])
      problems.push({
        level: 'error',
        path: 'brand.palette.preset',
        message: `la paleta "${presetId}" no existe para ${giro.label}`,
        hint: `Opciones: ${Object.keys(giro.palettes).join(', ')}`,
      });
    const takenHues = peers
      .map((p) => p.accentHue)
      .filter((h): h is number => h !== null);
    const freePalette = (p: GiroPalette) => {
      const hue = accentHue(p);
      return (
        hue === null ||
        takenHues.every((h) => hueDistance(h, hue) >= MIN_ACCENT_HUE_DISTANCE)
      );
    };
    const palettePool = Object.entries(giro.palettes).map(([pid, value]) => ({
      id: pid,
      value,
      pinned: false,
    }));
    const paletteChoice = candidates(pinnedPalette, palettePool, seed).find(
      (c) => freePalette(c.value),
    );
    if (!paletteChoice) {
      problems.push({
        level: 'error',
        path: 'brand.palette',
        message: `no queda paleta libre en ${giro.label}: todos los acentos están a < ${MIN_ACCENT_HUE_DISTANCE}° de otra plantilla`,
        hint: 'Define una paleta propia ({ "custom": { "bg", "accent" } }) con un tono de acento distinto, o agrega paletas al giro.',
      });
      continue;
    }
    if (pinnedPalette && paletteChoice.id !== pinnedPalette.id) {
      if (custom) {
        problems.push({
          level: 'error',
          path: 'brand.palette.custom',
          message: `el acento de la paleta propia está a < ${MIN_ACCENT_HUE_DISTANCE}° de otra plantilla de ${giro.label}`,
          hint: 'Cambia el tono del acento.',
        });
        continue;
      }
      choices.push(
        `paleta: "${pinnedPalette.id}" choca con otra plantilla del giro (tono de acento); usé "${paletteChoice.id}"`,
      );
    } else if (!paletteChoice.pinned)
      choices.push(`paleta: "${paletteChoice.id}" (elegida)`);

    // Font pair: unique in the giro.
    const takenFonts = new Set(peers.map((p) => p.fonts));
    const requested = resolveFontPair(brand.fontPair);
    if (brand.fontPair !== undefined && !requested)
      problems.push({
        level: 'error',
        path: 'brand.fontPair',
        message: `par tipográfico no permitido: ${JSON.stringify(brand.fontPair)}`,
        hint: `Pares curados: ${giro.fontPairs.join(', ')} (o { display, body } con fuentes de CUSTOM_FONTS)`,
      });
    const pinnedFont =
      requested && pinnedBrand(spec, tier, 'fontPair', twin)
        ? { id: requested.id, value: requested.fonts, pinned: true }
        : undefined;
    const fontPool = giro.fontPairs.map((fid) => ({
      id: fid,
      value: FONT_PAIRS[fid],
      pinned: false,
    }));
    const fontChoice = candidates<FontPairPreset>(
      pinnedFont,
      fontPool,
      seed,
    ).find((c) => !takenFonts.has(c.id));
    if (!fontChoice) {
      problems.push({
        level: 'error',
        path: 'brand.fontPair',
        message: `no queda par tipográfico libre en ${giro.label}`,
        hint: 'Usa { "display": "…", "body": "…" } con una combinación nueva.',
      });
      continue;
    }
    if (pinnedFont && fontChoice.id !== pinnedFont.id)
      choices.push(
        `tipografía: "${pinnedFont.id}" ya la usa otra plantilla del giro; usé "${fontChoice.id}"`,
      );
    else if (!fontChoice.pinned)
      choices.push(`tipografía: "${fontChoice.id}" (elegida)`);

    // Shape: no hard rule; it weighs in similarity.
    const shapeId =
      brand.shape &&
      SHAPES[brand.shape] &&
      pinnedBrand(spec, tier, 'shape', twin)
        ? brand.shape
        : rotate(giro.shapes, twin && tier === 'basico' ? seed + 1 : 0)[0];
    if (brand.shape && !SHAPES[brand.shape])
      problems.push({
        level: 'error',
        path: 'brand.shape',
        message: `forma desconocida: "${brand.shape}"`,
        hint: `Opciones: ${Object.keys(SHAPES).join(', ')}`,
      });
    const shape: ShapePreset = SHAPES[shapeId];

    // Hero variant: unique among Pro of the giro; a twin's Básico avoids its Pro's hero.
    const hero = sections.find((s) => s.slot === 'hero');
    if (hero) {
      const heroVariants = allowedVariants(blueprint, 'hero', 'hero');
      const taken = new Set(
        peers
          .filter((p) => (tier === 'pro' ? p.tier === 'pro' : p.sibling))
          .map((p) => p.hero),
      );
      if (taken.has(hero.variant)) {
        const free = [
          giro.sections[tier].find((d) => d.role === 'hero')?.variant,
          ...rotate(heroVariants, seed),
        ].find((v): v is string => Boolean(v) && !taken.has(v as string));
        if (hero.pinned && tier === 'pro') {
          problems.push({
            level: 'error',
            path: `sections.${tier}`,
            message: `hero/${hero.variant} ya lo usa otra plantilla Pro de ${giro.label}`,
            hint: free
              ? `Usa hero/${free} o quita la variante para que la elija el compilador.`
              : 'No quedan portadas libres.',
          });
        } else if (free) {
          choices.push(
            `portada: hero/${hero.variant} → hero/${free} (única en el giro)`,
          );
          hero.variant = free;
        } else if (tier === 'pro') {
          problems.push({
            level: 'error',
            path: `sections.${tier}`,
            message: `no quedan variantes de portada libres entre las Pro de ${giro.label}`,
          });
        }
      }
    }

    // Copy and headline: unique in the giro.
    const copy = tierCopy(spec, giro, tier, sections, branches);
    const pinnedTitle =
      spec.overrides?.[tier]?.copy?.hero?.title !== undefined ||
      (!(twin && tier === 'basico') && spec.copy?.hero?.title !== undefined);
    const titlePool = [
      ...(pinnedTitle || !(twin && tier === 'basico')
        ? [String(copy.hero?.title ?? '')]
        : []),
      ...((Array.isArray(spec.copy?.hero?.alternates)
        ? spec.copy.hero.alternates
        : []) as string[]),
      ...giro.heroAlternates,
    ]
      .filter(Boolean)
      .map((t) => fillBranch(t, branchName(spec, giro)));
    const takenTitles = new Set(peers.map((p) => p.headline).filter(Boolean));
    const title = titlePool.find(
      (t) => !takenTitles.has(normalizeHeadline(headlineOf(t, business))),
    );
    if (!title) {
      problems.push({
        level: 'error',
        path: 'copy.hero.title',
        message:
          'el titular del hero ya lo usa otra plantilla del giro y no quedan alternativas',
        hint: 'Escribe uno propio en copy.hero.title (o overrides.basico.copy.hero.title).',
      });
      continue;
    }
    if (copy.hero && title !== copy.hero.title) {
      if (pinnedTitle)
        choices.push(
          'titular: el del spec ya lo usa otra plantilla del giro; usé una alternativa',
        );
      else if (twin && tier === 'basico')
        choices.push('titular: alternativa para no repetir el de la Pro');
      copy.hero.title = title;
    }

    const theme = composeTheme({
      name: id,
      label: `${business.name} · ${TIER_LABEL[tier]}`,
      tier: kitTier,
      palette: paletteChoice.value,
      fontPair: { id: fontChoice.id, fonts: fontChoice.value },
      shape,
      brand,
    });
    const archetype =
      kitTier === 'basic'
        ? 'essential'
        : shape.archetype === 'editorial-atelier' &&
            paletteChoice.value.scheme === 'dark'
          ? 'street-luxe'
          : shape.archetype;

    const motion: ManifestMotion | undefined =
      tier === 'pro'
        ? {
            preset: spec.motion?.preset ?? giro.motion.preset,
            ...((spec.motion?.progress ?? giro.motion.progress)
              ? { progress: true }
              : {}),
            ...(spec.motion?.overrides &&
            Object.keys(spec.motion.overrides).length > 0
              ? {
                  sections: spec.motion.overrides as ManifestMotion['sections'],
                }
              : giro.motion.sections
                ? { sections: giro.motion.sections }
                : {}),
          }
        : undefined;

    const manifest: Manifest = {
      id,
      name: spec.overrides?.[tier]?.name ?? spec.name ?? business.name,
      category: giro.category,
      description:
        spec.overrides?.[tier]?.description ??
        spec.description ??
        giro.description[tier],
      family: 'service-landing',
      tier: kitTier,
      vertical: giro.id,
      archetype,
      theme: theme.name,
      content: contentName(spec),
      sections: sections.map((s) => ({ slot: s.slot, variant: s.variant })),
      ...(motion ? { motion } : {}),
    };

    // Similarity: swap unpinned variants until the tier's limit holds.
    const limit = TIERS[kitTier].similarityLimit;
    const sameTier = () => peers.filter((p) => p.tier === kitTier);
    const fp = () =>
      fingerprint(
        manifest,
        theme,
        headlineOf(String(copy.hero?.title ?? ''), business),
      );
    const worst = () =>
      Math.max(0, ...sameTier().map((p) => similarity(fp(), p).score));
    for (
      let round = 0;
      round < SWAPPABLE.length && worst() > limit;
      round += 1
    ) {
      let best: { index: number; variant: string; score: number } | undefined;
      for (const slot of SWAPPABLE) {
        const index = sections.findIndex((s) => s.slot === slot);
        if (index < 0 || sections[index].pinned) continue;
        const current = manifest.sections[index].variant;
        for (const variant of allowedVariants(
          blueprint,
          sections[index].role,
          slot,
        )) {
          if (variant === current) continue;
          manifest.sections[index].variant = variant;
          const score = worst();
          if (!best || score < best.score) best = { index, variant, score };
          manifest.sections[index].variant = current;
        }
      }
      if (!best || best.score >= worst()) break;
      choices.push(
        `similitud: ${manifest.sections[best.index].slot}/${manifest.sections[best.index].variant} → ${best.variant}`,
      );
      manifest.sections[best.index].variant = best.variant;
      sections[best.index].variant = best.variant;
    }
    if (worst() > limit)
      problems.push({
        level: 'error',
        path: `sections.${tier}`,
        message: `similitud ${worst()} con otra plantilla ${TIER_LABEL[tier]} del giro (límite ${limit})`,
        hint: 'Quita variantes fijas en sections para que el compilador pueda cambiarlas, o cambia el orden.',
      });

    // Links and branches depend on the final variants.
    const finalCopy = tierCopy(spec, giro, tier, sections, branches);
    finalCopy.hero = { ...finalCopy.hero, title: copy.hero?.title ?? '' };
    copies.set(tier, finalCopy);

    const print = fp();
    tiers.push({
      tier,
      id,
      manifest,
      theme,
      demoProfile: demoProfileOf(spec, giro, business),
      choices,
      fingerprint: print,
      imageKeys: [],
    });
    peers.push({ ...print, sibling: true });
  }

  if (tiers.length !== targets.length) return { problems };

  // The pack is the first tier's view (Pro of a twin); the other tier overrides what differs.
  const first = copies.get(tiers[0].tier) as Record<string, ContentObject>;
  const pack: ContentPack = {
    vertical: giro.id,
    locale: 'es-MX',
    business,
    head: headOf(spec, giro),
    sections: first,
  };
  for (const plan of tiers.slice(1)) {
    const view = copies.get(plan.tier) as Record<string, ContentObject>;
    plan.manifest.sections = plan.manifest.sections.map(
      (s): ManifestSection => {
        const mine = view[s.slot] ?? {};
        const shared = first[s.slot] ?? {};
        const props: ContentObject = {};
        for (const [k, v] of Object.entries(mine))
          if (canonicalJson(v) !== canonicalJson(shared[k])) props[k] = v;
        return Object.keys(props).length > 0 ? { ...s, props } : s;
      },
    );
    const head = headOf(spec, giro, plan.tier);
    if (canonicalJson(head) !== canonicalJson(pack.head))
      plan.manifest.head = head;
  }

  return {
    spec,
    giro,
    hash: specHash(spec),
    contentName: contentName(spec),
    pack,
    tiers,
    problems,
  };
}
