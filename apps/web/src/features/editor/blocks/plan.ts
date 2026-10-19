import { PLAN_CATALOG } from './plan-catalog.generated';
import type { SectionBlock } from './shared';

export type BlockPlan = 'basic' | 'pro';

const PRO_VARIANTS: ReadonlySet<string> = new Set(PLAN_CATALOG.proOnlyVariants);
const PRO_HOOKS: ReadonlySet<string> = new Set(PLAN_CATALOG.proOnlyHooks);

const ATTR_RE = /(?:^|[\s"'])(data-lz-[a-z-]+)(?=[\s=>"'\\/]|$)/g;

/** Pro-only Motion hooks anywhere in a block's content (attribute objects, traits or HTML strings). */
export function blockProHooks(block: Pick<SectionBlock, 'content'>): string[] {
  const text = JSON.stringify(block.content);
  const found = new Set<string>();
  for (const m of text.matchAll(ATTR_RE))
    if (PRO_HOOKS.has(m[1])) found.add(m[1]);
  return [...found].sort();
}

/**
 * Same rule as the API's plan guard, from the same generated catalog: a block is Pro when the kit
 * variant it stands for is Pro-only or its markup carries a Pro-only Motion hook.
 */
export function blockPlan(
  block: Pick<SectionBlock, 'content' | 'kitVariant'>,
): BlockPlan {
  if (block.kitVariant && PRO_VARIANTS.has(block.kitVariant)) return 'pro';
  return blockProHooks(block).length > 0 ? 'pro' : 'basic';
}
