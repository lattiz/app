import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The FAQ rebuilt from Stitch (tienda-caramelo-pop-bandas-01): one centered column of numbered panels. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('faq', 'column-panels');
  const giro = copySource('faq', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('faq', 'column-panels'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('faq', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('faq', 'column-panels'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('faq/column-panels', () => {
  it('has the reference anatomy: kicker, title, intro and one panel per question', async () => {
    const root = await render();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const panels = root.querySelectorAll('details.lz-faq-column-panels__panel');
    expect(panels.length).toBeGreaterThanOrEqual(4);
    for (const panel of panels) {
      expect(
        panel.querySelector('summary .lz-faq-column-panels__num'),
      ).not.toBeNull();
      expect(
        panel.querySelector('summary .lz-faq-column-panels__question')
          ?.textContent?.length,
      ).toBeGreaterThan(3);
      expect(
        panel.querySelector('.lz-faq-column-panels__answer')?.textContent
          ?.length,
      ).toBeGreaterThan(3);
    }
  });

  it('keeps the editor and no-JS contract: every panel <details open>, each on its own', async () => {
    const root = await render();
    for (const panel of root.querySelectorAll('details'))
      expect(panel.hasAttribute('open')).toBe(true);
    expect(root.querySelector('details[name]')).toBeNull();
    expect(root.querySelector(NO_JS)).toBeNull();
  });

  it('is a single column numbered by a CSS counter', () => {
    const sheet = css();
    expect(sheet).toMatch(/counter-increment: lz-faq-panel/);
    expect(sheet).toMatch(/counter\(lz-faq-panel\)/);
    expect(sheet).toMatch(/max-width: 768px/);
    expect(sheet).not.toMatch(/repeat\(2,/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });
});
