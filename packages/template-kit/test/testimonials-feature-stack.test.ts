import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The reviews rebuilt from Stitch (tienda-caramelo-pop-bandas-01): one featured quote beside stacked smaller ones. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('testimonials', 'feature-stack');
  const giro = copySource('testimonials', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('testimonials', 'feature-stack'),
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
    resolve(sectionDir('testimonials', 'feature-stack'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('testimonials/feature-stack', () => {
  it('renders every review with its quote and author', async () => {
    const root = await render();
    const cards = root.querySelectorAll(
      'figure.lz-testimonials-feature-stack__card',
    );
    expect(cards.length).toBeGreaterThanOrEqual(3);
    for (const card of cards) {
      expect(
        card.querySelector('blockquote')?.textContent?.length,
      ).toBeGreaterThan(10);
      expect(
        card.querySelector('.lz-testimonials-feature-stack__author')
          ?.textContent?.length,
      ).toBeGreaterThan(2);
    }
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('shows stars, initials and place only where the copy gives them', async () => {
    const cards = Array.from((await render()).querySelectorAll('figure'));
    expect(
      cards[0].querySelector('.lz-testimonials-feature-stack__stars')
        ?.textContent,
    ).toBe('★★★★★');
    expect(
      cards[1].querySelector('.lz-testimonials-feature-stack__stars'),
    ).toBeNull();
    const bare = Array.from(
      (
        await render({
          reviews: [
            { text: 'Una reseña sin extras para probar.', author: 'Ana P.' },
          ],
        })
      ).querySelectorAll('figure'),
    );
    expect(bare).toHaveLength(1);
    expect(
      bare[0].querySelector('.lz-testimonials-feature-stack__avatar'),
    ).toBeNull();
    expect(
      bare[0].querySelector('.lz-testimonials-feature-stack__place'),
    ).toBeNull();
  });

  it('features the first review by CSS and collapses to one column on mobile', () => {
    const sheet = css();
    expect(sheet).toMatch(/__card:first-child/);
    expect(sheet).toMatch(/grid-row: span 2/);
    expect(sheet).toMatch(/max-width: 992px/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });

  it('has no JS, style attribute, iframe or form', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
