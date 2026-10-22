import { describe, expect, it } from 'vitest';
import manifest from '../../../../../../packages/template-kit/catalog/catalog.manifest.json';
import { blockPlan } from './plan';
import { KIT_BLOCKS } from './kit-blocks.generated';
import { KIT_SECTION_BLOCKS } from './kit-blocks';

/** Sections whose design has no contact link (the craft section only tells how the work is done). */
const NO_CONTACT_LINK = new Set([
  'lzb-about-framed-craft',
  'lzb-gallery-staggered-frames',
]);
const sections = KIT_BLOCKS.filter((b) => 'kitVariant' in b);
/** Role modifiers (lz-btn--secondary) live in a primitive's base.css, as in kit templates. */
const ROLE_CLASSES = new Set(
  manifest.primitives.flatMap((p) => p.roles.map((r) => `${p.block}--${r}`)),
);

describe('kit blocks (generated from the kit)', () => {
  it('cover the new heroes, the cta and the seven primitives', () => {
    expect(KIT_BLOCKS.map((b) => b.id)).toEqual([
      'lzb-hero-bento',
      'lzb-hero-rail',
      'lzb-hero-overlap',
      'lzb-hero-stack',
      'lzb-hero-photo-ribbon',
      'lzb-faq-numbered-cards',
      'lzb-services-dish-spotlight',
      'lzb-services-ritual-cards',
      'lzb-services-schedule-cards',
      'lzb-testimonials-paper-trio',
      'lzb-about-framed-craft',
      'lzb-about-booking-steps',
      'lzb-locations-booking-panel',
      'lzb-gallery-staggered-frames',
      'lzb-cta-band',
      'lzb-cta-ritual-panels',
      'lzb-cta-urgent-line',
      'lzb-services-treatment-rows',
      'lzb-about-care-pathway',
      'lzb-services-collection-cards',
      'lzb-services-photo-rows',
      'lzb-cta-included-panel',
      'lzb-about-clock-rail',
      'lzb-services-party-tiers',
      'lzb-cta-ticket-stub-bill',
      'lzb-btn',
      'lzb-tile',
      'lzb-tag',
      'lzb-frame',
      'lzb-bignum',
      'lzb-pullquote',
      'lzb-rule',
    ]);
  });

  it('sections keep the kit root, slot and variant, so the API guard sees them', () => {
    for (const b of sections) {
      const [slot, variant] = (b as { kitVariant: string }).kitVariant.split(
        '/',
      );
      expect(b.content.attributes['data-lz-slot'], b.id).toBe(slot);
      expect(b.content.attributes['data-lz-variant'], b.id).toBe(variant);
      expect(b.content.classes, b.id).toContain(`lz-${slot}-${variant}`);
    }
  });

  it('never add a second <h1> or #hero to the page', () => {
    for (const b of KIT_BLOCKS) {
      expect(b.content.components, b.id).not.toMatch(/<h1[\s>]/);
      expect(b.content.attributes, b.id).not.toHaveProperty('id');
      expect(b.content.components, b.id).not.toMatch(/fetchpriority/);
    }
  });

  it('use tenant-sites tokens for contact data, never demo values', () => {
    for (const b of sections) {
      if (!NO_CONTACT_LINK.has(b.id))
        expect(b.content.components, b.id).toMatch(/\{\{lz:whatsapp_url\}\}/);
      expect(b.content.components, b.id).not.toMatch(/\{\{(?!lz:)/);
    }
  });

  it('ship only CSS for classes their markup uses (plus the token fallback)', () => {
    for (const b of KIT_BLOCKS) {
      const markup = `class="${b.content.classes.join(' ')}" ${b.content.components}`;
      const used = new Set(
        [...markup.matchAll(/class="([^"]*)"/g)].flatMap((m) =>
          m[1].split(/\s+/),
        ),
      );
      const css = b.content.styles.replace(/^:where\(html\)\{[^}]*\}/, '');
      const classes = new Set(
        [...css.matchAll(/\.(lz-[A-Za-z0-9_-]+)/g)].map((m) => m[1]),
      );
      const foreign = [...classes].filter(
        (c) =>
          !used.has(c) &&
          !ROLE_CLASSES.has(c) &&
          !c.startsWith('lz-page') &&
          !/^lz-(t|go|in|px|zoom)$/.test(c),
      );
      expect(foreign, b.id).toEqual([]);
      expect(b.content.styles.startsWith(':where(html){'), b.id).toBe(true);
    }
  });

  it('swap the placeholder marker for an SVG data URI in the editor', () => {
    for (const b of KIT_SECTION_BLOCKS) {
      const html = String(b.content.components);
      expect(html, b.id).not.toContain('lzb-placeholder');
      if (html.includes('<img'))
        expect(html, b.id).toContain('data:image/svg+xml');
    }
  });

  it('hero bento and the staggered gallery are Pro; the rest are Básico', () => {
    const plans = Object.fromEntries(
      KIT_SECTION_BLOCKS.map((b) => [b.id, blockPlan(b)]),
    );
    const pro = new Set(['lzb-hero-bento', 'lzb-gallery-staggered-frames']);
    for (const [id, plan] of Object.entries(plans))
      expect(plan, id).toBe(pro.has(id) ? 'pro' : 'basic');
  });
});
