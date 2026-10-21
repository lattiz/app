import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The booking steps rebuilt from Stitch (veterinaria-editorial-agenda-01): three numbered cards. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('about', 'booking-steps');
  const giro = copySource('about', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('about', 'booking-steps'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('about', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '02', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('about', 'booking-steps'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('about/booking-steps', () => {
  it('has the reference anatomy: kicker, one h2 and three numbered step cards', async () => {
    const root = await render();
    expect(root.id).toBe('nosotros');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const steps = root.querySelectorAll('li.lz-about-booking-steps__step');
    expect(steps).toHaveLength(3);
    expect(
      root.querySelector('ol.lz-about-booking-steps__list'),
    ).not.toBeNull();
    for (const step of steps) {
      expect(step.querySelector('.lz-about-booking-steps__num')).not.toBeNull();
      expect(step.querySelector('h3')?.textContent?.length).toBeGreaterThan(3);
      expect(
        step.querySelector('.lz-about-booking-steps__text')?.textContent
          ?.length,
      ).toBeGreaterThan(10);
    }
    expect(
      root.querySelector('a.lz-about-booking-steps__cta')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
  });

  it('drops the list and CTA when the copy has none', async () => {
    const root = await render({ steps: [], primaryCta: '', summary: '' });
    expect(root.querySelector('.lz-about-booking-steps__list')).toBeNull();
    expect(root.querySelector('.lz-about-booking-steps__cta')).toBeNull();
    expect(root.querySelector('.lz-about-booking-steps__summary')).toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('numbers the steps with a CSS counter and uses theme tokens only', () => {
    const sheet = css();
    expect(sheet).toMatch(/counter-increment: lz-booking-step/);
    expect(sheet).toMatch(/counter\(lz-booking-step, decimal-leading-zero\)/);
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(sheet).not.toMatch(/repeat\(2,/);
  });

  it('is static: no script, form or inline style', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
