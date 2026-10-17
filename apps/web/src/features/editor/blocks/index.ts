import { BASIC_BLOCKS } from './basic-blocks';
import { blockPlan } from './plan';
import { PRO_BLOCKS } from './pro-blocks';
import { PRO_BADGE, type SectionBlock } from './shared';

export const ALL_BLOCKS: readonly SectionBlock[] = [
  ...BASIC_BLOCKS,
  ...PRO_BLOCKS,
];

/**
 * Every block, with its plan derived from the kit catalog (plan.ts). Without Pro
 * (templateAccess.proIncluded) Pro blocks stay visible but locked: a «Pro» badge, no drag,
 * and a click calls onLockedClick (the upgrade prompt). Saved content is never touched.
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
