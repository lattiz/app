import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { ARCHETYPES, type Archetype, type ArchetypeId } from '../../archetypes';
import { DIRECTIONS, type ArtDirection } from '../../directions';
import { GIROS } from '../../giros';
import { hueDistance, hueOf, parseColor } from '../lib/color';
import { MIN_PALETTE_DISTANCE, paletteDistance } from '../lib/delta-e';
import { interpolate, mapsEmbedUrl, mapsLinkUrl } from '../lib/content';
import { loadBlueprint, loadSectionMeta } from '../lib/load';
import { KIT_ROOT, paths } from '../lib/paths';
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
  SHAPES,
  type FontPairPreset,
  type GiroPalette,
  type ShapePreset,
} from './presets';
import {
  parseSpec,
  type Spec,
  type SpecBrand,
  type SpecLayout,
  type SpecProblem,
  type SpecTier,
} from './schema';
import {
  densityFromDial,
  directionAcceptsFont,
  directionAcceptsPalette,
  directionFontPairs,
  directionPalettes,
  motionFromDial,
} from './direction';
import {
  catalogOf,
  fontPairById,
  fontPairPool,
  isLegacyVariant,
  paletteById,
  palettePool,
  type Catalog,
} from './catalog';
import { missingPaths } from './copy-keys';
import { lockPathFor, readLock, type SpecLock, type TierLock } from './lock';
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
    ? variant === 'single' || variant === 'single-card'
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
const fitCache = new Map<string, string[]>();
async function copyFits(
  slot: string,
  variant: string,
  data: ContentObject,
): Promise<boolean> {
  const key = `${slot}/${variant}`;
  if (!fitCache.has(key))
    fitCache.set(key, (await loadSectionMeta(slot, variant)).contentKeys);
  return (fitCache.get(key) ?? []).every(
    (k) => missingPaths(data, k).length === 0,
  );
}

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

export function branchName(spec: Spec, giro: GiroDefinition): string {
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
  const v = `v${spec.version ?? 1}`;
  return [
    { tier: 'pro', id: `${spec.giro}-${name}-${v}` },
    { tier: 'basico', id: `${spec.giro}-base-${name}-${v}` },
  ];
}

/** `specs/<stem>.spec.json`: the id (one tier), the idBase (twin) or `<idBase>-v<N>` (a versioned twin). */
export function specStem(spec: Spec): string {
  if (spec.id) return spec.id;
  return spec.version
    ? `${spec.idBase as string}-v${spec.version}`
    : (spec.idBase as string);
}

export function contentName(spec: Spec): string {
  const stem = specStem(spec);
  const voice = stem.startsWith(`${spec.giro}-`)
    ? stem.slice(spec.giro.length + 1)
    : stem;
  return `${spec.giro}.${voice}.es-MX`;
}

// ── Renewal (`renews`) ──────────────────────────────────────────────────────

export type RenewKeep = 'palette' | 'fontPair';

/** What a `renews` spec takes from the spec it replaces. */
export interface Renewal {
  stem: string;
  keep: RenewKeep[];
  /** Replaced id per tier: from this spec's lock, else from the old spec. */
  ids: Partial<Record<SpecTier, string>>;
  /** The old spec's lock tier, per tier (absent once the old spec is gone). */
  inherited: Partial<Record<SpecTier, TierLock>>;
}

/**
 * Reads `specs/<renews.spec>.spec.json` and its lock. Once this spec's own lock exists the old files
 * are optional, so the old template can be deleted after it's retired.
 */
export function loadRenewal(
  spec: Spec,
  lock: SpecLock | undefined,
  specsDir = resolve(KIT_ROOT, 'specs'),
): Renewal | { problems: SpecProblem[] } | undefined {
  if (!spec.renews) return undefined;
  const stem = spec.renews.spec;
  const fail = (message: string, hint?: string) => ({
    problems: [
      {
        level: 'error' as const,
        path: 'renews.spec',
        message,
        ...(hint ? { hint } : {}),
      },
    ],
  });
  if (stem === specStem(spec))
    return fail('`renews` no puede apuntar al mismo spec');
  const file = resolve(specsDir, `${stem}.spec.json`);
  let old: Spec | undefined;
  if (existsSync(file)) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      return fail(`specs/${stem}.spec.json no es JSON válido`);
    }
    const parsed = parseSpec(raw);
    if (!parsed.ok) return fail(`specs/${stem}.spec.json no es un spec válido`);
    old = parsed.spec;
    if (old.giro !== spec.giro)
      return fail(
        `\`renews\` apunta a un spec de otro giro (${old.giro}); una renovación es del mismo giro`,
      );
  }
  const oldLock = old ? readLock(lockPathFor(file)) : undefined;
  const oldTargets = old ? specTargets(old) : [];
  const ids: Renewal['ids'] = {};
  const inherited: Renewal['inherited'] = {};
  for (const { tier, id } of specTargets(spec)) {
    const recorded = lock?.tiers[id]?.renews;
    const target = oldTargets.find((t) => t.tier === tier)?.id;
    const renewed = recorded ?? target;
    if (renewed) ids[tier] = renewed;
    const oldTier = target ? oldLock?.tiers[target] : undefined;
    if (oldTier) inherited[tier] = oldTier;
    if (!lock?.tiers[id] && !oldTier)
      return fail(
        `no encuentro el lock de specs/${stem} para heredar la identidad de ${TIER_LABEL[tier]}`,
        old
          ? `Corre \`pnpm lattiz spec lock ${stem}\` primero.`
          : `Restaura specs/${stem}.spec.json y su lock, o crea el lock de este spec antes de borrarlos.`,
      );
  }
  return {
    stem,
    keep: spec.renews.keep ?? ['palette', 'fontPair'],
    ids,
    inherited,
  };
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
  /** Pinned by the spec's lock (not by the spec): a conflict asks for `spec lock --refresh`. */
  locked?: boolean;
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
  /** Ids the lock records (palette `custom` for a spec's own palette). */
  resolved: { palette: string; fontPair: string; shape: string };
  /** Layout specs: the art direction and page archetype that drove the picks. */
  layout?: { direction?: string; archetype?: ArchetypeId };
  sections: ResolvedSection[];
  /** `renews`: the id of the same tier this template replaces. */
  renews?: string;
}

export interface SpecPlan {
  spec: Spec;
  giro: GiroDefinition;
  catalog: Catalog;
  hash: string;
  contentName: string;
  pack: ContentPack;
  tiers: TierPlan[];
  problems: SpecProblem[];
}

/** Layout preference for a role (extended specs with `layout`): an override pins, a preference doesn't. */
type LayoutPick = (
  role: Role,
  slot: string,
) => { variant: string; pinned: boolean } | undefined;

function sectionsFor(
  spec: Spec,
  giro: GiroDefinition,
  tier: SpecTier,
  blueprint: Blueprint,
  catalog: Catalog,
  locked?: TierLock,
  pick?: LayoutPick,
): ResolvedSection[] {
  const slots = blueprint.verticals[giro.id]?.slots ?? {};
  const defaults = giro.sections[tier];
  const entries: { role: Role; slot?: string; variant?: string }[] =
    spec.sections?.[tier] ?? defaults.map((d) => ({ role: d.role }));
  return entries.map((entry) => {
    const slot = slots[entry.role] ?? entry.slot ?? entry.role;
    const pinned = typeof entry.variant === 'string';
    const fromLock = pinned
      ? undefined
      : locked?.sections.find((l) => l.role === entry.role && l.slot === slot)
          ?.variant;
    const layout = pinned || fromLock ? undefined : pick?.(entry.role, slot);
    const variant =
      entry.variant ??
      fromLock ??
      layout?.variant ??
      defaults.find((d) => d.role === entry.role)?.variant ??
      allowedVariants(blueprint, entry.role, slot, catalog)[0];
    return fromLock
      ? { role: entry.role, slot, variant, pinned: true, locked: true }
      : {
          role: entry.role,
          slot,
          variant,
          pinned: pinned || Boolean(layout?.pinned),
        };
  });
}

/**
 * Variants a role may take in a tier: the blueprint's list, else every folder of the slot. A legacy
 * spec only sees the variants that existed before the extended catalog (LEGACY_VARIANTS).
 */
export function allowedVariants(
  blueprint: Blueprint,
  role: Role,
  slot: string,
  catalog: Catalog = 'legacy',
): string[] {
  const listed = blueprint.roles[role]?.variants;
  const dir = resolve(paths.sections, slot);
  const all =
    listed ??
    (existsSync(dir)
      ? readdirSync(dir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
          .sort()
      : []);
  return catalog === 'legacy'
    ? all.filter((v) => isLegacyVariant(slot, v))
    : all;
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
  key: Exclude<keyof SpecBrand, 'catalog'>,
  twin: boolean,
): boolean {
  if (spec.overrides?.[tier]?.brand?.[key] !== undefined) return true;
  if (twin && tier === 'basico') return false;
  return spec.brand?.[key] !== undefined;
}

export function businessOf(spec: Spec, giro: GiroDefinition): Business {
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
    (s) =>
      s.slot === 'locations' &&
      (s.variant === 'single' || s.variant === 'single-card'),
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

const CSS_BYTES = new Map<string, number>();
/** Raw size of a variant's section.css (Básico layout picks prefer the lighter of equals). */
/** A variant whose CSS a `no-gradients` direction would reject (legacy scrims are exempt, as in directionFindings). */
function breaksDirection(
  direction: ArtDirection | undefined,
  slot: string,
  variant: string,
): boolean {
  if (!direction?.rules.includes('no-gradients')) return false;
  if (isLegacyVariant(slot, variant)) return false;
  const file = resolve(paths.sections, slot, variant, 'section.css');
  return existsSync(file) && /gradient\(/.test(readFileSync(file, 'utf8'));
}

function cssBytes(slot: string, variant: string): number {
  const key = `${slot}/${variant}`;
  if (!CSS_BYTES.has(key)) {
    const file = resolve(paths.sections, slot, variant, 'section.css');
    CSS_BYTES.set(key, existsSync(file) ? statSync(file).size : 0);
  }
  return CSS_BYTES.get(key) as number;
}

/** Hero composition on the variance dial (1 symmetric … 10 asymmetric); unknown heroes sit in the middle. */
const HERO_VARIANCE: Record<string, number> = {
  'centered-arch': 2,
  panel: 3,
  columns: 4,
  split: 4,
  rail: 5,
  'image-bg': 5,
  'offset-card': 6,
  framed: 6,
  'duo-arch': 6,
  overlap: 7,
  stack: 7,
  bento: 8,
  poster: 9,
};

/** The direction's heroes then the archetype's, the variance dial reordering the direction's by closeness. */
function heroPreferences(
  kitTier: Tier,
  direction: ArtDirection | undefined,
  archetype: Archetype | undefined,
  variance: number | undefined,
): string[] {
  const own = [...(direction?.heroes[kitTier] ?? [])];
  if (variance !== undefined)
    own.sort(
      (a, b) =>
        Math.abs((HERO_VARIANCE[a] ?? 5) - variance) -
        Math.abs((HERO_VARIANCE[b] ?? 5) - variance),
    );
  const fromArchetype =
    archetype?.sections[kitTier].find((s) => s.role === 'hero')?.variants ?? [];
  return [...new Set([...own, ...fromArchetype])];
}

/** Brand of a tier with the direction's taste under the spec's own choices (spec wins). */
function brandWithLayout(
  brand: SpecBrand,
  direction: ArtDirection | undefined,
  layout: SpecLayout | undefined,
): SpecBrand {
  const density = layout?.dials?.density;
  if (!direction && density === undefined) return brand;
  return {
    ...brand,
    style: {
      ...(direction?.style ?? {}),
      ...(density !== undefined ? { density: densityFromDial(density) } : {}),
      ...(brand.style ?? {}),
    },
    ...(direction || brand.primitives
      ? {
          primitives: {
            ...(direction?.primitives ?? {}),
            ...(brand.primitives ?? {}),
          },
        }
      : {}),
  };
}

/** Pool ids reordered: the preferred ones first (rotated by the seed), then the rest (rotated). */
function preferFirst<T extends { id: string }>(
  pool: T[],
  preferred: string[],
  seed: number,
): T[] {
  const set = new Set(preferred);
  const first = preferred
    .map((id) => pool.find((p) => p.id === id))
    .filter((p): p is T => Boolean(p));
  return [
    ...rotate(first, seed),
    ...rotate(
      pool.filter((p) => !set.has(p.id)),
      seed,
    ),
  ];
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
  lock?: SpecLock,
  options: { specsDir?: string } = {},
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
  const catalog = catalogOf(spec);
  // Extended specs only: art direction, archetype, variant overrides and dials.
  const layout = catalog === 'extended' ? spec.layout : undefined;
  const direction = layout?.direction
    ? DIRECTIONS[layout.direction]
    : undefined;
  const archetypeId = layout?.archetype ?? direction?.archetypes[0];
  const archetype = archetypeId
    ? (ARCHETYPES as Record<string, Archetype | undefined>)[archetypeId]
    : undefined;
  const layoutProblems: SpecProblem[] = [];
  if (layout?.direction && !direction)
    layoutProblems.push({
      level: 'error',
      path: 'layout.direction',
      message: `dirección de arte desconocida: "${layout.direction}"`,
    });
  if (layout?.archetype && !archetype)
    layoutProblems.push({
      level: 'error',
      path: 'layout.archetype',
      message: `arquetipo desconocido: "${layout.archetype}"`,
    });
  if (layoutProblems.length > 0) return { problems: layoutProblems };
  // A lock resolved against the other catalog no longer describes this spec.
  const useLock = lock && lock.catalog === catalog ? lock : undefined;
  const lockHint = `Si quieres que el compilador vuelva a elegir: \`pnpm lattiz spec lock ${specStem(spec)} --refresh\`.`;
  const targets = specTargets(spec);
  const twin = targets.length === 2;
  const ownIds = new Set(targets.map((t) => t.id));
  const renewal = loadRenewal(spec, useLock, options.specsDir);
  if (renewal && 'problems' in renewal) return renewal;
  // A template and the one it renews coexist until the old one is retired: they aren't peers.
  const renewedIds = new Set(Object.values(renewal?.ids ?? {}));
  const peers: Peer[] = library.filter(
    (f) =>
      f.vertical === giro.id &&
      !ownIds.has(f.id) &&
      !renewedIds.has(f.id) &&
      !(f.renews && ownIds.has(f.renews)),
  );
  const business = businessOf(spec, giro);
  const branches = branchesOf(spec, giro);
  const tiers: TierPlan[] = [];
  const copies = new Map<SpecTier, Record<string, ContentObject>>();

  for (const { tier, id } of targets) {
    const kitTier = KIT_TIER[tier];
    const blueprint = await loadBlueprint('service-landing', kitTier);
    const brand = brandWithLayout(brandFor(spec, tier), direction, layout);
    const seed = seedOf(id);
    const choices: string[] = [];
    const locked = useLock?.tiers[id];
    const renewedId = renewal?.ids[tier];
    const inherited = locked ? undefined : renewal?.inherited[tier];
    const lockedPaletteId =
      locked?.palette ??
      (renewal?.keep.includes('palette') ? inherited?.palette : undefined);
    const lockedFontId =
      locked?.fontPair ??
      (renewal?.keep.includes('fontPair') ? inherited?.fontPair : undefined);
    const renewHint = (keep: RenewKeep) =>
      `\`renews\` hereda esto de ${renewedId}: quita "${keep}" de \`renews.keep\` o fíjalo en el spec.`;
    const heroPrefs = heroPreferences(
      kitTier,
      direction,
      archetype,
      layout?.dials?.variance,
    );
    const pick: LayoutPick | undefined = layout
      ? (role, slot) => {
          const allowed = allowedVariants(blueprint, role, slot, catalog);
          const override =
            layout.variantOverrides?.[role] ?? layout.variantOverrides?.[slot];
          if (override && allowed.includes(override))
            return { variant: override, pinned: true };
          const preferred =
            role === 'hero'
              ? heroPrefs
              : (archetype?.sections[kitTier].find((s) => s.role === role)
                  ?.variants ?? []);
          const options = preferred.filter(
            (v) => allowed.includes(v) && !breaksDirection(direction, slot, v),
          );
          // Básico stays light (budgets.json): the lightest of the archetype's choices for a role.
          const variant =
            kitTier === 'basic' && role !== 'hero'
              ? [...options].sort(
                  (x, y) => cssBytes(slot, x) - cssBytes(slot, y),
                )[0]
              : options[0];
          return variant ? { variant, pinned: false } : undefined;
        }
      : undefined;
    const sections = sectionsFor(
      spec,
      giro,
      tier,
      blueprint,
      catalog,
      locked,
      pick,
    );
    if (direction) choices.push(`dirección: ${direction.id}`);
    if (archetype && layout) choices.push(`arquetipo: ${archetype.id}`);

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
    const presetValue = presetId ? paletteById(giro, presetId) : undefined;
    if (
      inherited &&
      lockedPaletteId === 'custom' &&
      !palettePick &&
      !pinnedBrand(spec, tier, 'palette', twin)
    ) {
      problems.push({
        level: 'error',
        path: 'brand.palette',
        message: `${renewedId} usa una paleta propia y este spec no la trae`,
        hint: `Copia \`brand.palette.custom\` del spec ${renewal?.stem}, o ${renewHint('palette')}`,
      });
      continue;
    }
    const lockedPalette =
      !palettePick &&
      !pinnedBrand(spec, tier, 'palette', twin) &&
      lockedPaletteId &&
      paletteById(giro, lockedPaletteId)
        ? {
            id: lockedPaletteId,
            value: paletteById(giro, lockedPaletteId) as GiroPalette,
            pinned: true,
          }
        : undefined;
    const pinnedPalette =
      palettePick ??
      lockedPalette ??
      (presetId && presetValue && pinnedBrand(spec, tier, 'palette', twin)
        ? { id: presetId, value: presetValue, pinned: true }
        : undefined);
    if (presetId && !presetValue)
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
      const hueFree =
        hue === null ||
        takenHues.every((h) => hueDistance(h, hue) >= MIN_ACCENT_HUE_DISTANCE);
      // Extended only: a neutral accent passes the hue rule, so also keep palettes ΔE-apart.
      if (!hueFree || catalog === 'legacy') return hueFree;
      const own = { bg: p.colors.bg, accent: p.colors.accent };
      return peers.every(
        (q) =>
          !q.bg ||
          !q.accent ||
          !/^#/.test(own.bg) ||
          !/^#/.test(own.accent) ||
          paletteDistance(own, { bg: q.bg, accent: q.accent }) >=
            MIN_PALETTE_DISTANCE,
      );
    };
    const paletteCandidates = palettePool(giro, catalog).map(
      ([pid, value]) => ({ id: pid, value, pinned: false }),
    );
    const paletteOrder = direction
      ? ((pool: Pick<GiroPalette>[]) =>
          pinnedPalette
            ? [pinnedPalette, ...pool.filter((p) => p.id !== pinnedPalette.id)]
            : pool)(
          preferFirst(
            paletteCandidates.filter((c) =>
              directionAcceptsPalette(direction, c.value),
            ),
            directionPalettes(direction, giro.id),
            seed,
          ),
        )
      : candidates(pinnedPalette, paletteCandidates, seed);
    const paletteChoice = paletteOrder.find((c) => freePalette(c.value));
    if (!paletteChoice) {
      problems.push({
        level: 'error',
        path: 'brand.palette',
        message: direction
          ? `no queda paleta libre en ${giro.label} que respete la dirección ${direction.id} (${direction.rules.join(', ') || 'sin reglas de color'})`
          : `no queda paleta libre en ${giro.label}: todos los acentos están a < ${MIN_ACCENT_HUE_DISTANCE}° de otra plantilla`,
        hint: 'Define una paleta propia ({ "custom": { "bg", "accent" } }) con un tono de acento distinto, o agrega paletas al giro.',
      });
      continue;
    }
    if (lockedPalette && paletteChoice.id !== lockedPalette.id) {
      problems.push({
        level: 'error',
        path: 'brand.palette',
        message: locked
          ? `el lock fija la paleta "${lockedPalette.id}" para ${id}, pero ya choca con otra plantilla del giro`
          : `la paleta heredada "${lockedPalette.id}" (de ${renewedId}) choca con otra plantilla del giro${direction ? ` o no cumple la dirección ${direction.id}` : ''}`,
        hint: locked ? lockHint : renewHint('palette'),
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
    else if (lockedPalette)
      choices.push(
        `paleta: "${paletteChoice.id}" (${locked ? 'del lock' : `heredada de ${renewedId}`})`,
      );

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
    const lockedFont =
      !pinnedBrand(spec, tier, 'fontPair', twin) &&
      lockedFontId &&
      fontPairById(lockedFontId)
        ? {
            id: lockedFontId,
            value: fontPairById(lockedFontId) as FontPairPreset,
            pinned: true,
          }
        : undefined;
    const pinnedFont =
      lockedFont ??
      (requested && pinnedBrand(spec, tier, 'fontPair', twin)
        ? { id: requested.id, value: requested.fonts, pinned: true }
        : undefined);
    const fontPool = fontPairPool(giro, catalog).map((fid) => ({
      id: fid,
      value: fontPairById(fid) as FontPairPreset,
      pinned: false,
    }));
    const fontOrder = direction
      ? ((pool: Pick<FontPairPreset>[]) =>
          pinnedFont
            ? [pinnedFont, ...pool.filter((p) => p.id !== pinnedFont.id)]
            : pool)(
          preferFirst(
            [
              ...fontPool,
              ...directionFontPairs(direction, giro.id)
                .filter((fid) => !fontPool.some((f) => f.id === fid))
                .filter((fid) => fontPairById(fid))
                .map((fid) => ({
                  id: fid,
                  value: fontPairById(fid) as FontPairPreset,
                  pinned: false,
                })),
            ],
            directionFontPairs(direction, giro.id),
            seed,
          ).filter((f) => directionAcceptsFont(direction, f.value)),
        )
      : candidates<FontPairPreset>(pinnedFont, fontPool, seed);
    const fontChoice = fontOrder.find((c) => !takenFonts.has(c.id));
    if (!fontChoice) {
      problems.push({
        level: 'error',
        path: 'brand.fontPair',
        message: `no queda par tipográfico libre en ${giro.label}`,
        hint: 'Usa { "display": "…", "body": "…" } con una combinación nueva.',
      });
      continue;
    }
    if (lockedFont && fontChoice.id !== lockedFont.id) {
      problems.push({
        level: 'error',
        path: 'brand.fontPair',
        message: locked
          ? `el lock fija la tipografía "${lockedFont.id}" para ${id}, pero ya la usa otra plantilla del giro`
          : `la tipografía heredada "${lockedFont.id}" (de ${renewedId}) ya la usa otra plantilla del giro${direction ? ` o no cumple la dirección ${direction.id}` : ''}`,
        hint: locked ? lockHint : renewHint('fontPair'),
      });
      continue;
    }
    if (pinnedFont && fontChoice.id !== pinnedFont.id)
      choices.push(
        `tipografía: "${pinnedFont.id}" ya la usa otra plantilla del giro; usé "${fontChoice.id}"`,
      );
    else if (!fontChoice.pinned)
      choices.push(`tipografía: "${fontChoice.id}" (elegida)`);
    else if (lockedFont)
      choices.push(
        `tipografía: "${fontChoice.id}" (${locked ? 'del lock' : `heredada de ${renewedId}`})`,
      );

    // Shape: no hard rule; it weighs in similarity.
    const shapeId =
      brand.shape &&
      SHAPES[brand.shape] &&
      pinnedBrand(spec, tier, 'shape', twin)
        ? brand.shape
        : locked && SHAPES[locked.shape]
          ? locked.shape
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
      const heroVariants = allowedVariants(blueprint, 'hero', 'hero', catalog);
      const taken = new Set(
        peers
          .filter((p) => (tier === 'pro' ? p.tier === 'pro' : p.sibling))
          .map((p) => p.hero),
      );
      if (taken.has(hero.variant)) {
        const free = [
          ...heroPrefs.filter((v) => heroVariants.includes(v)),
          giro.sections[tier].find((d) => d.role === 'hero')?.variant,
          ...rotate(heroVariants, seed),
        ].find((v): v is string => Boolean(v) && !taken.has(v as string));
        if (hero.pinned && tier === 'pro') {
          problems.push({
            level: 'error',
            path: `sections.${tier}`,
            message: `hero/${hero.variant}${hero.locked ? ' (fijada por el lock)' : ''} ya lo usa otra plantilla Pro de ${giro.label}`,
            hint: hero.locked
              ? lockHint
              : free
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
    const manifestArchetype =
      locked?.archetype ??
      (kitTier === 'basic'
        ? 'essential'
        : archetype && layout
          ? archetype.blueprintArchetype
          : shape.archetype === 'editorial-atelier' &&
              paletteChoice.value.scheme === 'dark'
            ? 'street-luxe'
            : shape.archetype);

    const motion: ManifestMotion | undefined =
      tier === 'pro'
        ? {
            preset:
              spec.motion?.preset ??
              (layout?.dials?.motion !== undefined
                ? motionFromDial(layout.dials.motion)
                : direction?.motion) ??
              giro.motion.preset,
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
      archetype: manifestArchetype,
      theme: theme.name,
      content: contentName(spec),
      sections: sections.map((s) => ({ slot: s.slot, variant: s.variant })),
      ...(motion ? { motion } : {}),
      ...(renewedId ? { renews: renewedId } : {}),
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
          catalog,
        )) {
          if (variant === current) continue;
          // A variant whose copy the giro doesn't write (product-grid outside tienda) is never a candidate.
          if (!(await copyFits(slot, variant, copy[slot] ?? {}))) continue;
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
        hint: sections.some((s) => s.locked)
          ? lockHint
          : 'Quita variantes fijas en sections para que el compilador pueda cambiarlas, o cambia el orden.',
      });

    // Links and branches depend on the final variants.
    const finalCopy = tierCopy(spec, giro, tier, sections, branches);
    finalCopy.hero = { ...finalCopy.hero, title: copy.hero?.title ?? '' };
    // Layout specs only: a variant's sample copy fills the keys no giro writes yet.
    if (layout)
      for (const s of sections) {
        const sample = (await loadSectionMeta(s.slot, s.variant)).sample;
        if (sample)
          finalCopy[s.slot] = {
            ...clone(sample),
            ...(finalCopy[s.slot] ?? {}),
          };
      }
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
      resolved: {
        palette: paletteChoice.id,
        fontPair: fontChoice.id,
        shape: shapeId,
      },
      sections,
      ...(renewedId ? { renews: renewedId } : {}),
      ...(layout
        ? {
            layout: {
              ...(direction ? { direction: direction.id } : {}),
              ...(archetype ? { archetype: archetype.id } : {}),
            },
          }
        : {}),
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
    catalog,
    hash: specHash(spec),
    contentName: contentName(spec),
    pack,
    tiers,
    problems,
  };
}
