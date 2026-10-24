import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The reviews rebuilt from Stitch (barberia-abeto-indice-01): one strip of quotes split by vertical rules. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('testimonials', 'hairline-trio');
  const giro = copySource('testimonials', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('testimonials', 'hairline-trio'),
    'section.html',
  );
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('testimonials', giro, business, 'demo', {
      ...meta.sample,
      ...extra,
    }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('testimonials', 'hairline-trio'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';
const TOKENS_ONLY = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/;

describe('testimonials/hairline-trio', () => {
  it('renders each review as a figure with quote mark, text and signature', async () => {
    const root = await render();
    const quotes = root.querySelectorAll(
      '.lz-testimonials-hairline-trio__quote',
    );
    expect(quotes).toHaveLength(3);
    for (const q of quotes) {
      expect(q.querySelector('blockquote')?.textContent).toMatch(/\S/);
      expect(
        q.querySelector('.lz-testimonials-hairline-trio__author')?.textContent,
      ).toMatch(/\S/);
    }
  });

  it('drops the optional place, intro, kicker and CTA', async () => {
    const root = await render({
      kicker: '',
      intro: '',
      cta: '',
      reviews: [{ text: 'Muy bien.', author: 'Ana R.' }],
    });
    expect(
      root.querySelector('.lz-testimonials-hairline-trio__place'),
    ).toBeNull();
    expect(
      root.querySelector('.lz-testimonials-hairline-trio__intro'),
    ).toBeNull();
    expect(
      root.querySelector('.lz-testimonials-hairline-trio__kicker'),
    ).toBeNull();
    expect(
      root.querySelector('.lz-testimonials-hairline-trio__cta'),
    ).toBeNull();
  });

  it('keeps the no-JS and token-only contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(TOKENS_ONLY);
  });
});
