import { describe, expect, it } from 'vitest';
import manifest from '../../../../../../packages/template-kit/catalog/catalog.manifest.json';
import { PLAN_CATALOG as API_PLAN_CATALOG } from '../../../../../api/src/modules/sites/plan-catalog.generated';
import { ALL_BLOCKS, blocksConfig, sectionBlocks } from './index';
import { blockPlan, blockProHooks } from './plan';
import { PLAN_CATALOG } from './plan-catalog.generated';

const variants = new Map(manifest.variants.map((v) => [v.key, v]));
const proHooks = manifest.hooks
  .filter((h) => h.proOnly)
  .map((h) => h.attribute);

describe('plan catalog: editor, kit manifest and API agree', () => {
  it('the editor and the API read the same generated slice of the current manifest', () => {
    expect(PLAN_CATALOG).toEqual(API_PLAN_CATALOG);
    expect(PLAN_CATALOG.manifestHash).toBe(manifest.contentHash);
  });

  it('every catalog variant and hook has the same plan in the manifest and the editor slice', () => {
    for (const v of manifest.variants)
      expect(
        (PLAN_CATALOG.proOnlyVariants as readonly string[]).includes(v.key),
        v.key,
      ).toBe(v.proOnly);
    expect([...PLAN_CATALOG.proOnlyHooks].sort()).toEqual([...proHooks].sort());
  });

  it('gallery and hero/bento are Pro-only everywhere', () => {
    for (const key of [
      'gallery/grid',
      'gallery/strip',
      'gallery/bento',
      'hero/bento',
    ])
      expect(variants.get(key)?.proOnly, key).toBe(true);
  });
});

describe('editor blocks', () => {
  it('ids are unique and keep the lzb- prefix', () => {
    const ids = ALL_BLOCKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^lzb-/);
  });

  it('a block that stands for a kit variant points at a real one and is never cheaper than it', () => {
    for (const block of ALL_BLOCKS) {
      if (block.editorOnly) {
        expect(block.kitVariant, block.id).toBeUndefined();
        continue;
      }
      if (block.kitPrimitive) {
        expect(
          manifest.primitives.map((p) => p.family),
          block.id,
        ).toContain(block.kitPrimitive);
        continue;
      }
      const v = variants.get(block.kitVariant ?? '');
      expect(v, `${block.id} → ${block.kitVariant}`).toBeDefined();
      if (v?.proOnly) expect(blockPlan(block), block.id).toBe('pro');
    }
  });

  it('a block carrying a Pro-only Motion hook is Pro', () => {
    for (const block of ALL_BLOCKS)
      if (blockProHooks(block).length > 0)
        expect(blockPlan(block), block.id).toBe('pro');
  });

  it('derived plans of the existing blocks (gallery-grid moved to Pro)', () => {
    const plans = Object.fromEntries(
      ALL_BLOCKS.map((b) => [b.id, blockPlan(b)]),
    );
    expect(plans).toMatchObject({
      'lzb-hero-simple': 'basic',
      'lzb-services-grid': 'basic',
      'lzb-contact-hours': 'basic',
      'lzb-gallery-grid': 'pro',
      'lzb-hero-editorial': 'pro',
      'lzb-marquee': 'pro',
      'lzb-stacked-cards': 'pro',
      'lzb-snap-gallery': 'pro',
      'lzb-before-after': 'pro',
      'lzb-stats': 'pro',
      'lzb-promo-bar': 'pro',
      'lzb-open-now': 'pro',
      'lzb-whatsapp-cards': 'pro',
    });
  });

  it('the three editor-only blocks are the documented ones', () => {
    expect(
      ALL_BLOCKS.filter((b) => b.editorOnly)
        .map((b) => b.id)
        .sort(),
    ).toEqual(['lzb-before-after', 'lzb-open-now', 'lzb-stacked-cards']);
  });
});

describe('sectionBlocks', () => {
  it('with Pro every block is available as defined', () => {
    const blocks = sectionBlocks(true);
    expect(blocks).toHaveLength(ALL_BLOCKS.length);
    expect(blocks.some((b) => b.disable)).toBe(false);
  });

  it('without Pro, Pro blocks stay visible but locked and their click asks to upgrade', () => {
    const clicked: string[] = [];
    const blocks = sectionBlocks(false, (b) => clicked.push(b.id));
    expect(blocks).toHaveLength(ALL_BLOCKS.length);
    for (const b of blocks) {
      const pro = blockPlan(b) === 'pro';
      expect(Boolean(b.disable), b.id).toBe(pro);
      if (!pro) continue;
      expect(b.label).toMatch(/ · Pro$/);
      expect(b.media).toContain('lzb-pro-badge');
      b.onClick?.();
    }
    expect(clicked).toContain('lzb-gallery-grid');
  });

  it('locking never changes what a block inserts', () => {
    const open = new Map(sectionBlocks(true).map((b) => [b.id, b.content]));
    for (const b of sectionBlocks(false))
      expect(b.content).toBe(open.get(b.id));
  });
});

describe('blocksConfig', () => {
  const click = (cfg: ReturnType<typeof blocksConfig>, id: string) =>
    cfg.appendOnClick({ block: { getId: () => id } });

  it('without Pro, a click on a locked block inserts nothing and asks to upgrade', () => {
    const asked: string[] = [];
    const cfg = blocksConfig(false, (b) => asked.push(b.id));
    expect(click(cfg, 'lzb-gallery-grid')).toBe(false);
    expect(click(cfg, 'lzb-hero-bento')).toBe(false);
    expect(click(cfg, 'lzb-hero-rail')).toBe(true);
    expect(click(cfg, 'lzb-hero-simple')).toBe(true);
    expect(asked).toEqual(['lzb-gallery-grid', 'lzb-hero-bento']);
  });

  it('with Pro every click inserts', () => {
    const cfg = blocksConfig(true, () => {
      throw new Error('no prompt with Pro');
    });
    for (const b of ALL_BLOCKS) expect(click(cfg, b.id), b.id).toBe(true);
  });
});
