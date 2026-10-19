import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { usage } from '../../lib/errors';
import type { Candidate, Harvest } from '../types';
import { paletteFromTokens } from './palette';
import { interactivityOf } from './interactivity';
import { sectionPatterns } from './patterns';
import { resolvePatterns } from './resolve';
import { tokensFromDesignMd, tokensFromHtml } from './tokens';
import { typographyFromTokens } from './typography';

/**
 * Candidate folder → Harvest. Local files only (design.md and/or source.html): the harvester never
 * calls Stitch and never keeps an image URL. Tokens come from design.md when it has them (it is the
 * file Stitch treats as the design system), otherwise from the HTML's Tailwind config.
 */
export function harvestFolder(candidate: Candidate, dir: string): Harvest {
  const mdFile = join(dir, 'design.md');
  const htmlFile = join(dir, 'source.html');
  const md = existsSync(mdFile) ? readFileSync(mdFile, 'utf8') : null;
  const html = existsSync(htmlFile) ? readFileSync(htmlFile, 'utf8') : null;
  if (md === null && html === null)
    throw usage(
      `"${candidate.id}" no tiene design.md ni source.html.`,
      'Trae uno con: pnpm lattiz design gen --giro <g> --import <archivo>',
    );
  const fromMd = md ? tokensFromDesignMd(md) : null;
  const fromHtml = html ? tokensFromHtml(html) : null;
  const tokens = fromMd ?? fromHtml;
  const title =
    /^name:\s*(.+)$/m.exec(md ?? '')?.[1]?.trim() ??
    /<title>([^<]+)<\/title>/i.exec(html ?? '')?.[1]?.trim() ??
    candidate.id;
  const patterns = html
    ? sectionPatterns(html)
    : { sections: [], notMappable: [], imagesIgnored: 0, imageNeeds: [] };
  const resolved = resolvePatterns(patterns.sections, candidate.id);
  const typography = tokens
    ? typographyFromTokens({
        ...tokens,
        linkedFamilies: [
          ...new Set([
            ...tokens.linkedFamilies,
            ...(fromHtml?.linkedFamilies ?? []),
          ]),
        ],
      })
    : {
        scale: [],
        googleFamilies: [],
        unsupportedFamilies: [],
        excludedFamilies: [],
        metrics: {},
        delivery: { ok: false, problems: ['sin tokens tipográficos'] },
      };
  return {
    version: 1,
    candidate_id: candidate.id,
    input: fromMd
      ? { file: 'design.md', kind: 'design-md' }
      : { file: 'source.html', kind: 'html' },
    palette: tokens
      ? paletteFromTokens(tokens, { title, giro: candidate.giro })
      : null,
    typography,
    sections: resolved.sections,
    not_mappable: [...patterns.notMappable, ...resolved.notMappable],
    interactivity: html ? interactivityOf(html) : [],
    image_needs: patterns.imageNeeds,
    images_ignored: patterns.imagesIgnored,
  };
}
