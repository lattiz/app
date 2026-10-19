import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';

/** The reviews rebuilt from Stitch (barberia-don-porfirio-01): centered header + three paper/slate quote cards. */
async function render() {
  const meta = await loadSectionMeta('testimonials', 'paper-trio');
  const giro = copySource('testimonials', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('testimonials', 'paper-trio'),
    'section.html',
  );
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('testimonials', giro, business, 'demo', meta.sample),
    { business, index: '05', source: file },
  );
}

describe('testimonials/paper-trio', () => {
  it('has the reference anatomy: header and one figure per review with quote, author and place', async () => {
    const root = await render();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const cards = root.querySelectorAll(
      'figure.lz-testimonials-paper-trio__card',
    );
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(
        card.querySelector('blockquote')?.textContent?.length,
      ).toBeGreaterThan(20);
      expect(
        card.querySelector('.lz-testimonials-paper-trio__author')?.textContent
          ?.length,
      ).toBeGreaterThan(2);
      expect(
        card.querySelector('.lz-testimonials-paper-trio__place')?.textContent
          ?.length,
      ).toBeGreaterThan(2);
    }
  });

  it('is static and drops the optional pieces', async () => {
    const root = await render();
    expect(root.querySelector('.lz-testimonials-paper-trio__cta')).toBeNull();
    expect(root.querySelector('script, [style], iframe, form')).toBeNull();
  });

  it('swaps colors on odd cards with theme tokens only, and the quote mark is decoration', () => {
    const css = readFileSync(
      resolve(sectionDir('testimonials', 'paper-trio'), 'section.css'),
      'utf8',
    );
    expect(css).toMatch(
      /:nth-child\(odd\)\s*\{[^}]*background: var\(--lz-color-text\)/,
    );
    expect(css).toMatch(/content: '\\201C'/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });
});
