/**
 * Plan guard for site schemas: finds the kit's Pro-only sections (data-lz-slot + data-lz-variant)
 * and Motion hooks in what a tenant saves or publishes, and decides whether a plan without Pro may
 * keep them. Pure functions only; SchemaPlanGuard wires them to the request.
 */
import { PLAN_CATALOG } from './plan-catalog.generated';

export const SCHEMA_PLAN_ENFORCEMENT_MODES = [
  'off',
  'report',
  'enforce',
] as const;
export type SchemaPlanEnforcement =
  (typeof SCHEMA_PLAN_ENFORCEMENT_MODES)[number];

export interface ProMarkers {
  /** `slot/variant` of Pro-only kit sections. */
  variants: string[];
  /** Motion hooks; inert without Pro (tenant-sites injects Motion only for Pro). */
  hooks: string[];
}

export type PlanGuardVerdict = 'clean' | 'flagged' | 'downgraded';

export interface PlanGuardDecision {
  verdict: PlanGuardVerdict;
  /** Markers the plan doesn't include and the tenant's own template didn't ship with. */
  offending: ProMarkers;
  /** True only for offending sections: hooks alone never block, they do nothing without Pro. */
  blocking: boolean;
}

/** Bounded walk: a project bigger than this is scanned up to here (and logged as truncated). */
export const MAX_PROJECT_NODES = 500_000;
/** Tags longer than this are skipped by the HTML scan (no real section tag gets close). */
const MAX_TAG_LENGTH = 8_192;

const PRO_VARIANTS: ReadonlySet<string> = new Set(PLAN_CATALOG.proOnlyVariants);
const PRO_HOOKS: ReadonlySet<string> = new Set(PLAN_CATALOG.proOnlyHooks);

export const NO_MARKERS: ProMarkers = { variants: [], hooks: [] };

export function parseEnforcementMode(
  value: string | undefined,
): SchemaPlanEnforcement | null {
  const v = (value ?? '').trim().toLowerCase();
  if (v === '') return 'report';
  return (SCHEMA_PLAN_ENFORCEMENT_MODES as readonly string[]).includes(v)
    ? (v as SchemaPlanEnforcement)
    : null;
}

function collect(
  variants: Set<string>,
  hooks: Set<string>,
  attrs: Record<string, unknown>,
): void {
  const slot = attrs['data-lz-slot'];
  const variant = attrs['data-lz-variant'];
  if (typeof slot === 'string' && typeof variant === 'string') {
    const key = `${slot}/${variant}`;
    if (PRO_VARIANTS.has(key)) variants.add(key);
  }
  for (const name of Object.keys(attrs))
    if (PRO_HOOKS.has(name)) hooks.add(name);
}

const done = (variants: Set<string>, hooks: Set<string>): ProMarkers => ({
  variants: [...variants].sort(),
  hooks: [...hooks].sort(),
});

/**
 * Pro markers in a GrapesJS project (already parsed JSON): every component's `attributes`.
 * Iterative and capped at MAX_PROJECT_NODES visits, so a hostile payload can't run unbounded.
 */
export function proMarkersInProject(project: unknown): ProMarkers & {
  truncated: boolean;
} {
  const variants = new Set<string>();
  const hooks = new Set<string>();
  const stack: unknown[] = [project];
  let visited = 0;
  while (stack.length > 0) {
    if (++visited > MAX_PROJECT_NODES)
      return { ...done(variants, hooks), truncated: true };
    const node = stack.pop();
    if (Array.isArray(node)) {
      for (const item of node)
        if (item && typeof item === 'object') stack.push(item);
      continue;
    }
    if (!node || typeof node !== 'object') continue;
    const record = node as Record<string, unknown>;
    const attrs = record.attributes;
    if (attrs && typeof attrs === 'object' && !Array.isArray(attrs))
      collect(variants, hooks, attrs as Record<string, unknown>);
    for (const value of Object.values(record))
      if (value && typeof value === 'object') stack.push(value);
  }
  return { ...done(variants, hooks), truncated: false };
}

const TAG_RE = /<[a-z][^<>]*\sdata-lz-[^<>]*>/gi;
const ATTR_RE = /\s(data-lz-[a-z-]+)(?:="([^"]*)")?/gi;

/** Pro markers in exported HTML: one linear pass over the tags that carry a data-lz-* attribute. */
export function proMarkersInHtml(html: string): ProMarkers {
  const variants = new Set<string>();
  const hooks = new Set<string>();
  for (const match of html.matchAll(TAG_RE)) {
    const tag = match[0];
    if (tag.length > MAX_TAG_LENGTH) continue;
    const attrs: Record<string, string> = {};
    for (const a of tag.matchAll(ATTR_RE))
      attrs[a[1].toLowerCase()] = a[2] ?? '';
    collect(variants, hooks, attrs);
  }
  return done(variants, hooks);
}

export function mergeMarkers(...all: ProMarkers[]): ProMarkers {
  return {
    variants: [...new Set(all.flatMap((m) => m.variants))].sort(),
    hooks: [...new Set(all.flatMap((m) => m.hooks))].sort(),
  };
}

export const hasMarkers = (m: ProMarkers) =>
  m.variants.length > 0 || m.hooks.length > 0;

export interface PlanGuardInput {
  found: ProMarkers;
  /** templateAccess.proIncluded: the same rule the editor uses to offer Pro blocks. */
  proIncluded: boolean;
  /** Tier of the tenant's current template (site_schemas.template_id), null when unknown. */
  currentTemplateTier: string | null;
  /** Markers of the tenant's current template: what it shipped with is always allowed. */
  templateMarkers: ProMarkers;
}

/**
 * clean: nothing Pro-only, a plan with Pro, or only what the template shipped with.
 * downgraded: a Pro template on a plan without Pro (A1/A2 downgrade rule owns that case): log only.
 * flagged: Pro-only markers the plan doesn't include; blocking when sections are among them.
 */
export function decidePlanGuard(input: PlanGuardInput): PlanGuardDecision {
  if (input.proIncluded || !hasMarkers(input.found))
    return { verdict: 'clean', offending: NO_MARKERS, blocking: false };
  const allowedVariants = new Set(input.templateMarkers.variants);
  const allowedHooks = new Set(input.templateMarkers.hooks);
  const offending: ProMarkers = {
    variants: input.found.variants.filter((v) => !allowedVariants.has(v)),
    hooks: input.found.hooks.filter((h) => !allowedHooks.has(h)),
  };
  if (!hasMarkers(offending))
    return { verdict: 'clean', offending: NO_MARKERS, blocking: false };
  if (
    input.currentTemplateTier !== 'basic' &&
    input.currentTemplateTier !== null
  )
    return { verdict: 'downgraded', offending, blocking: false };
  return {
    verdict: 'flagged',
    offending,
    blocking: offending.variants.length > 0,
  };
}
