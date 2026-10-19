import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { FAMILIES } from '../../../../template-kit/archetypes/families';
import { kitFile } from '../promote/kit';
import { metaSource, variantName } from '../promote/section';
import { scaffoldFor } from '../promote/section-templates';
import type { FidelityEntry } from '../fidelity';
import type { RebuildItem, SectionPattern } from '../types';

/** (slot, layout) pairs the kit already builds, with the variant that does it. */
const EXISTING: Record<string, string> = {
  'hero/split': 'hero/split',
  'hero/photo-overlay': 'hero/photo-ribbon',
  'footer/link-columns': 'footer/columns',
  'services/card-grid': 'services/cards',
  'about/stat-row': 'about/stats-strip',
  'about/split': 'about/text-image-offset',
  'cta/band': 'cta/band',
  'faq/list': 'faq/list',
  'faq/card-grid': 'faq/grid',
  'testimonials/card-grid': 'testimonials/cards',
};

const LAYOUT_FAMILY: Record<string, string> = {
  split: 'media-text',
  centered: 'type',
  'card-grid': 'cells',
  bento: 'cells',
  'stat-row': 'figures',
  quote: 'quote',
  'link-columns': 'chrome',
  band: 'band',
  list: 'rows',
  'photo-overlay': 'full-media',
};

/** Existing variants of the slot in the same composition family: the dedupe report. */
export function similarVariants(p: SectionPattern): string[] {
  const family = LAYOUT_FAMILY[p.layout];
  return Object.entries(FAMILIES)
    .filter(([key, fam]) => fam === family && key.startsWith(`${p.slot}/`))
    .map(([key]) => key)
    .filter((key) => folderExists(key));
}

export const folderExists = (key: string) =>
  existsSync(kitFile('sections', ...key.split('/')));

/**
 * Pattern → one of: already in the kit (a MEASURED match), a draft for an additive variant, or a
 * section to rebuild by hand. A same-slot, same-layout variant is only a `reuse_candidate`: layout
 * class is not enough to say "already exists" (a card grid with numbered cards and a centered header
 * is not the kit's plain card grid). Never writes anything: drafts live in harvest.json until `promote`.
 */
export function resolvePatterns(
  patterns: SectionPattern[],
  candidateId: string,
  fidelity: Record<string, FidelityEntry> = {},
): { sections: SectionPattern[]; rebuild: RebuildItem[] } {
  const sections: SectionPattern[] = [];
  const rebuild: RebuildItem[] = [];
  for (const p of patterns) {
    const key = `${p.slot}/${p.layout}`;
    const fid = fidelity[p.ref];
    const measured = fid
      ? {
          verdict: fid.verdict,
          best: fid.best,
          structure: fid.measured[0]?.structure ?? 1,
        }
      : undefined;
    if (
      measured?.verdict === 'match' &&
      measured.best &&
      folderExists(measured.best)
    ) {
      sections.push({ ...p, existing: measured.best, fidelity: measured });
      continue;
    }
    const guess = EXISTING[key];
    const reuse = !measured && guess && folderExists(guess) ? guess : undefined;
    const similar = similarVariants(p);
    const base = {
      ...p,
      ...(reuse ? { reuse_candidate: reuse } : {}),
      ...(similar.length ? { similar } : {}),
      ...(measured ? { fidelity: measured } : {}),
    };
    const variant = variantName(p);
    const scaffold = scaffoldFor(variant, p);
    if (!scaffold) {
      sections.push(base);
      rebuild.push({
        ref: p.ref,
        slot: p.slot,
        layout: p.layout,
        reason: measured
          ? `medida: ninguna variante del kit se parece (mejor ${measured.best ?? '—'} a ${measured.structure}); sin generador: reconstrúyela a mano`
          : `sin medir${reuse ? ` (¿${reuse}?)` : ''}: corre «lattiz design fidelity» y, si es distinta, reconstrúyela a mano`,
      });
      continue;
    }
    sections.push({
      ...base,
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
  return { sections, rebuild };
}
