import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { kitFile } from '../promote/kit';
import { metaSource, variantName } from '../promote/section';
import { scaffoldFor } from '../promote/section-templates';
import type { NotMappable, SectionPattern } from '../types';

/** (slot, layout) pairs the kit already builds, with the variant that does it. */
const EXISTING: Record<string, string> = {
  'hero/split': 'hero/split',
  'footer/link-columns': 'footer/columns',
  'services/card-grid': 'services/cards',
  'about/stat-row': 'about/stats-strip',
  'about/split': 'about/text-image-offset',
  'cta/band': 'cta/band',
  'faq/list': 'faq/list',
  'faq/card-grid': 'faq/grid',
  'testimonials/card-grid': 'testimonials/cards',
};

export const folderExists = (key: string) =>
  existsSync(kitFile('sections', ...key.split('/')));

/**
 * Pattern → one of: already in the kit ("use <slot/variant>"), a draft for an additive variant, or
 * not mappable. Never writes anything: drafts live in harvest.json until `promote`.
 */
export function resolvePatterns(
  patterns: SectionPattern[],
  candidateId: string,
): { sections: SectionPattern[]; notMappable: NotMappable[] } {
  const sections: SectionPattern[] = [];
  const notMappable: NotMappable[] = [];
  for (const p of patterns) {
    const key = `${p.slot}/${p.layout}`;
    const existing = EXISTING[key];
    if (existing && folderExists(existing)) {
      sections.push({ ...p, existing });
      continue;
    }
    const variant = variantName(p);
    const scaffold = scaffoldFor(variant, p);
    if (!scaffold) {
      notMappable.push({
        ref: p.ref,
        reason: `${key}: el kit aún no sabe construirlo desde un patrón (sin variante equivalente ni generador)`,
      });
      continue;
    }
    sections.push({
      ...p,
      draft: {
        variant,
        html: scaffold.html,
        css: scaffold.css,
        meta_ts: metaSource(p.slot, variant, scaffold, candidateId),
        bytes: {
          html: Buffer.byteLength(scaffold.html),
          css: Buffer.byteLength(scaffold.css),
          css_gzip: gzipSync(scaffold.css).length,
        },
      },
    });
  }
  return { sections, notMappable };
}
