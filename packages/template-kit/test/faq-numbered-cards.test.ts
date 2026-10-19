import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';

/** The FAQ rebuilt from Stitch (barberia-don-porfirio-01): centered header + numbered cards that open one by one. */
async function render() {
  const meta = await loadSectionMeta('faq', 'numbered-cards');
  const giro = copySource('faq', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('faq', 'numbered-cards'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('faq', giro, business, 'demo', meta.sample),
    { business, index: '06', source: file },
  );
}

describe('faq/numbered-cards', () => {
  it('has the reference anatomy: kicker, title, intro and one card per question', async () => {
    const root = await render();
    expect(
      root.querySelector('.lz-faq-numbered-cards__kicker')?.textContent,
    ).toMatch(/Preguntas/);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const cards = root.querySelectorAll('details.lz-faq-numbered-cards__card');
    expect(cards.length).toBeGreaterThanOrEqual(4);
    for (const card of cards) {
      expect(
        card.querySelector('summary .lz-faq-numbered-cards__num'),
      ).not.toBeNull();
      expect(
        card.querySelector('summary .lz-faq-numbered-cards__question')
          ?.textContent?.length,
      ).toBeGreaterThan(3);
      expect(
        card.querySelector('.lz-faq-numbered-cards__answer')?.textContent
          ?.length,
      ).toBeGreaterThan(3);
    }
  });

  it('keeps the editor and no-JS contract: every card <details open>, each opens on its own', async () => {
    const root = await render();
    for (const card of root.querySelectorAll('details'))
      expect(card.hasAttribute('open')).toBe(true);
    // No shared name: exclusive accordions would close the other cards.
    expect(root.querySelector('details[name]')).toBeNull();
    expect(root.querySelector('script, [style], iframe, form')).toBeNull();
  });

  it('numbers the cards with a CSS counter, so numbering is not content', () => {
    const css = readFileSync(
      resolve(sectionDir('faq', 'numbered-cards'), 'section.css'),
      'utf8',
    );
    expect(css).toMatch(/counter-increment: lz-faq-card/);
    expect(css).toMatch(/counter\(lz-faq-card, decimal-leading-zero\)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(css).toMatch(/prefers-reduced-motion/);
  });
});
