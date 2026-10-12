/**
 * Local render of a compiled template through the production serve pipeline:
 * the seed's motion tagging (scripts/lib/motion-sections) → composeSiteHtml (tenant-sites route.ts).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  type BusinessProfile,
  parseBusinessProfile,
} from '../../../../apps/tenant-sites/lib/business-profile';
import { composeSiteHtml } from '../../../../apps/tenant-sites/lib/compose-site';
import { loadPreviewConfig } from '../../../../apps/tenant-sites/lib/preview-config';
import {
  MOTION_PRESETS,
  motionHtml,
  type MotionPreset,
  type SectionOverrides,
  type SectionRow,
} from '../../../../scripts/lib/motion-sections';
import { demoProfileFile, paths } from './paths';
import { readDist } from './templates';

export { MOTION_PRESETS, type MotionPreset };

export interface PreviewOptions {
  origin: string;
  /** Pro only: Básico never gets the runtime, as in production. */
  motion: boolean;
  preset?: MotionPreset;
  reducedMotion?: boolean;
  /** Swap the minified runtime for apps/tenant-sites/lib/lz-motion/src (runtime authors). */
  runtimeSrc?: boolean;
}

export interface Preview {
  html: string;
  tier: 'basic' | 'pro';
  preset: MotionPreset;
  rows: SectionRow[];
  profileSource: string | null;
}

export function demoProfile(id: string): {
  profile: BusinessProfile;
  source: string | null;
} {
  const file = demoProfileFile(id);
  if (!existsSync(file)) return { profile: {}, source: null };
  return {
    profile: parseBusinessProfile(JSON.parse(readFileSync(file, 'utf8'))),
    source: `packages/template-kit/demo-profiles/${id}.json`,
  };
}

export function templatePreset(meta: {
  motion?: { preset?: MotionPreset };
}): MotionPreset {
  return meta.motion?.preset ?? 'none';
}

// Emulates prefers-reduced-motion for the template CSS and the runtime's matchMedia check.
const REDUCED_SHIM = `<script>(function(){var m=window.matchMedia;window.matchMedia=function(q){return /prefers-reduced-motion:\\s*reduce/.test(q)?{matches:true,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}}:m.call(window,q)}})();</script>`;

export function emulateReducedMotion(html: string): string {
  return html
    .replace(/prefers-reduced-motion:\s*reduce/g, 'min-width: 0px')
    .replace(/prefers-reduced-motion:\s*no-preference/g, 'max-width: 0px')
    .replace(/<head([^>]*)>/i, `<head$1>${REDUCED_SHIM}`);
}

function withRuntimeSource(html: string): string {
  const css = readFileSync(resolve(paths.motionSrc, 'style.css'), 'utf8');
  const js = readFileSync(resolve(paths.motionSrc, 'runtime.js'), 'utf8');
  return html
    .replace(
      /(<style id="lz-motion-css">)[\s\S]*?(<\/style>)/,
      (_m, a: string, b: string) => a + css + b,
    )
    .replace(
      /(<script id="lz-motion">)[\s\S]*?(<\/script>)/,
      (_m, a: string, b: string) => a + js + b,
    );
}

export function renderPreview(id: string, opts: PreviewOptions): Preview {
  const dist = readDist(id);
  const tier = dist.meta.tier;
  const preset = opts.preset ?? templatePreset(dist.meta);
  const sections: SectionOverrides = (dist.meta.motion?.sections ??
    {}) as SectionOverrides;
  // The seed tags every template (stage 1b); only the serve step decides whether the runtime runs.
  const tagged = motionHtml(dist.html, preset, sections, false);
  const { profile, source } = demoProfile(id);
  let html = composeSiteHtml({
    exportedHtml: tagged.html,
    profile,
    tenantName: dist.manifest.name,
    seoTitle: null,
    seoDescription: null,
    ogSiteName: null,
    canonicalOrigin: opts.origin,
    noindex: true,
    ogImageUrl: `${opts.origin}/api/og`,
    faviconLightUrl: null,
    faviconDarkUrl: null,
    isPaid: true,
    isPro: tier === 'pro' && opts.motion,
    // GA4 only runs for a tenant with a Measurement ID; a template preview has none.
    analyticsMeasurementId: null,
    preview: loadPreviewConfig({}),
  });
  if (opts.runtimeSrc) html = withRuntimeSource(html);
  if (opts.reducedMotion) html = emulateReducedMotion(html);
  return {
    html,
    tier,
    preset,
    rows: tagged.result.rows,
    profileSource: source,
  };
}
