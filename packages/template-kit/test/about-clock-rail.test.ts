import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The party-day itinerary rebuilt from Stitch (floreria-casa-confeti-salon-de-fiestas-infantiles-01): clock times on a rail. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('about', 'clock-rail');
  const giro = copySource('about', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('about', 'clock-rail'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('about', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '02', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('about', 'clock-rail'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('about/clock-rail', () => {
  it('has one h2, an ordered rail and a stop per moment with time, title and text', async () => {
    const root = await render();
    expect(root.id).toBe('nosotros');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(root.querySelector('ol.lz-about-clock-rail__rail')).not.toBeNull();
    const stops = root.querySelectorAll('li.lz-about-clock-rail__stop');
    expect(stops).toHaveLength(5);
    for (const stop of stops) {
      expect(
        stop.querySelector('.lz-about-clock-rail__time')?.textContent,
      ).toMatch(/\d{1,2}:\d{2}/);
      expect(stop.querySelector('.lz-about-clock-rail__mark')).not.toBeNull();
      expect(stop.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
    }
    expect(
      root.querySelector('a.lz-about-clock-rail__cta')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
  });

  it('is not a numbered-card panel: no counter, no card boxes', () => {
    const sheet = css();
    expect(sheet).not.toMatch(/counter-increment|counter\(/);
    expect(sheet).not.toMatch(/--lz-card-border|--lz-radius-card/);
  });

  it('drops the rail, note and CTA when the copy has none', async () => {
    const root = await render({
      moments: [],
      primaryCta: '',
      statement: '',
      summary: '',
    });
    expect(root.querySelector('.lz-about-clock-rail__rail')).toBeNull();
    expect(root.querySelector('.lz-about-clock-rail__foot')).toBeNull();
    expect(root.querySelector('.lz-about-clock-rail__summary')).toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('uses theme tokens only and handles the narrow layouts', () => {
    const sheet = css();
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).toMatch(/max-width: 992px/);
    expect(sheet).toMatch(/max-width: 480px/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });

  it('is static: no script, form or inline style', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
