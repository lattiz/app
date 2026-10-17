import { KIT_BLOCKS } from './kit-blocks.generated';
import { ICONS, placeholder, type SectionBlock } from './shared';

const PLACEHOLDER_RE = /lzb-placeholder:(\d+)x(\d+)/g;

/** Kit sections and primitives (generated from the kit): same markup, classes and CSS as a kit template. */
export const KIT_SECTION_BLOCKS: SectionBlock[] = KIT_BLOCKS.map((b) => ({
  id: b.id,
  label: b.label,
  category: b.category,
  media: ICONS[b.icon as keyof typeof ICONS],
  ...('kitVariant' in b ? { kitVariant: b.kitVariant } : {}),
  ...('kitPrimitive' in b ? { kitPrimitive: b.kitPrimitive } : {}),
  content: {
    ...b.content,
    components: b.content.components.replace(
      PLACEHOLDER_RE,
      (_m, w: string, h: string) => placeholder(Number(w), Number(h)),
    ),
  },
}));
