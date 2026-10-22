import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The recovery pathway rebuilt from Stitch (clinica-cauce-etapas-menu-01): four linked stages. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('about', 'care-pathway');
  const giro = copySource('about', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('about', 'care-pathway'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('about', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '02', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('about', 'care-pathway'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('about/care-pathway', () => {
  it('has the reference anatomy: sticky head, one h2 and four linked steps with phase tags', async () => {
    const root = await render();
    expect(root.id).toBe('nosotros');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const steps = root.querySelectorAll('li.lz-about-care-pathway__step');
    expect(steps).toHaveLength(4);
    expect(root.querySelector('ol.lz-about-care-pathway__list')).not.toBeNull();
    for (const step of steps) {
      expect(step.querySelector('.lz-about-care-pathway__node')).not.toBeNull();
      expect(step.querySelector('.lz-about-care-pathway__num')).not.toBeNull();
      expect(step.querySelector('h3')?.textContent?.length).toBeGreaterThan(3);
      expect(
        step.querySelector('.lz-about-care-pathway__text')?.textContent?.length,
      ).toBeGreaterThan(10);
      expect(
        step.querySelector('.lz-about-care-pathway__tag')?.textContent?.length,
      ).toBeGreaterThan(3);
    }
    expect(
      root.querySelector('a.lz-about-care-pathway__cta')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
  });

  it('drops the list, tags and CTA when the copy has none', async () => {
    const root = await render({
      steps: [],
      primaryCta: '',
      summary: '',
      kicker: '',
    });
    expect(root.querySelector('.lz-about-care-pathway__list')).toBeNull();
    expect(root.querySelector('.lz-about-care-pathway__cta')).toBeNull();
    expect(root.querySelector('.lz-about-care-pathway__summary')).toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('numbers the steps with a CSS counter, draws a rail and uses theme tokens only', () => {
    const sheet = css();
    expect(sheet).toMatch(/counter-increment: lz-care-step/);
    expect(sheet).toMatch(/counter\(lz-care-step, decimal-leading-zero\)/);
    expect(sheet).toMatch(/lz-about-care-pathway__rail::before/);
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(sheet).not.toMatch(/backdrop-filter/);
  });

  it('is static: no script, form or inline style', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
