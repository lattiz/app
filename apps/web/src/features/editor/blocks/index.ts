import { BASIC_BLOCKS } from './basic-blocks';
import { PRO_BLOCKS } from './pro-blocks';
import type { SectionBlock } from './shared';

/** Básico gets the basic kit; plans that include Pro (templateAccess.proIncluded) also get the Pro kit. */
export function sectionBlocks(proIncluded: boolean): SectionBlock[] {
  return proIncluded ? [...BASIC_BLOCKS, ...PRO_BLOCKS] : BASIC_BLOCKS;
}
