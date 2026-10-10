import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractFromHtml } from '../src/lib/extract';
import { KIT_ROOT } from '../src/lib/paths';

const html = readFileSync(
  resolve(KIT_ROOT, 'fixtures/oxido/index.html'),
  'utf8',
);
const css = readFileSync(resolve(KIT_ROOT, 'fixtures/oxido/style.css'), 'utf8');

describe('extract (ÓXIDO Studio export)', () => {
  const result = extractFromHtml({ html, css, fallbackVariant: 'urban-luxe' });

  it('writes one section per slot, keeping each slot’s own variant', () => {
    expect(result.sections.map((s) => `${s.slot}/${s.variant}`)).toContain(
      'hero/image-bg',
    );
    expect(result.sections).toHaveLength(10);
  });

  it('drops Studio global-style classes, rules and the :root block', () => {
    const all = [
      result.core,
      ...result.sections.map((s) => s.html + s.css),
    ].join('\n');
    expect(all).not.toMatch(/gjs-t-/);
    expect(result.core).not.toContain(':root');
  });

  it('moves the :root tokens and font query into a theme draft', () => {
    expect(result.themeDraft.colors.accent).toBe('#FF4F1F');
    expect(result.themeDraft.shape.radiusPill).toBe('2px');
    expect(result.themeDraft.shape.radiusCard).toBe('2px');
    expect(result.themeDraft.fonts.googleFonts).toBe(
      'family=Anton&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;700',
    );
    expect(result.themeDraft.colors['line-strong']).toBe('TODO');
  });

  it('routes rules and keyframes to the slot that owns them', () => {
    const bySlot = Object.fromEntries(
      result.sections.map((s) => [s.slot, s.css]),
    );
    expect(bySlot.marquee).toContain('@keyframes lz-marquee');
    expect(bySlot['floating-whatsapp']).toContain('@keyframes lz-pulse');
    expect(bySlot.navbar).toContain('.lz-navbar__cta .lz-button');
    expect(result.core).toContain('.lz-button {');
    expect(result.core).not.toContain('.lz-hero {');
  });

  it('reports the literals left to tokenize', () => {
    const literals = result.sections.flatMap((s) => s.literals).join('\n');
    expect(literals).toContain('.lz-navbar { background: rgba(…) }');
    expect(literals).toContain(
      '.lz-footer__wordmark { -webkit-text-stroke: rgba(…) }',
    );
    expect(result.coreLiterals.join('\n')).toContain('.lz-sticker');
  });
});
