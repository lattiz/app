import { BASIC_BLOCKS } from './basic-blocks';
import { KIT_SECTION_BLOCKS } from './kit-blocks';
import { blockPlan } from './plan';
import { PRO_BLOCKS } from './pro-blocks';
import { PRO_BADGE, type SectionBlock } from './shared';

export const ALL_BLOCKS: readonly SectionBlock[] = [
  ...BASIC_BLOCKS,
  ...KIT_SECTION_BLOCKS,
  ...PRO_BLOCKS,
];

/**
 * Every block, with its plan derived from the kit catalog (plan.ts). Without Pro
 * (templateAccess.proIncluded) Pro blocks stay visible but locked: a «Pro» badge and no drag.
 * Saved content is never touched.
 */
export function sectionBlocks(
  proIncluded: boolean,
  onLockedClick: (block: SectionBlock) => void = () => {},
): SectionBlock[] {
  return ALL_BLOCKS.map((block) => {
    if (proIncluded || blockPlan(block) === 'basic') return block;
    return {
      ...block,
      label: `${block.label} · Pro`,
      media: `${block.media}${PRO_BADGE}`,
      disable: true,
      onClick: () => onLockedClick(block),
    };
  });
}

/**
 * Studio's block options. Studio 1.1.1 click-inserts even a disabled block and ignores its
 * onClick, so appendOnClick refuses locked blocks and opens the upgrade prompt instead.
 */
export function blocksConfig(
  proIncluded: boolean,
  onLockedClick: (block: SectionBlock) => void = () => {},
): {
  default: SectionBlock[];
  appendOnClick: (ctx: { block: { getId: () => string } }) => boolean;
} {
  const blocks = sectionBlocks(proIncluded, onLockedClick);
  const locked = new Map(
    ALL_BLOCKS.filter((b) => !proIncluded && blockPlan(b) === 'pro').map(
      (b) => [b.id, b],
    ),
  );
  return {
    default: blocks,
    appendOnClick: ({ block }) => {
      const hit = locked.get(block.getId());
      if (!hit) return true;
      onLockedClick(hit);
      return false;
    },
  };
}
