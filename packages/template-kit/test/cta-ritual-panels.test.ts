import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The ritual rebuilt from the Abeto Stitch capture: four numbered panels on a tinted band. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('cta', 'ritual-panels');
  const giro = copySource('cta', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('cta', 'ritual-panels'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('cta', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '03', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('cta', 'ritual-panels'), 'section.css'),
    'utf8',
  );
}

describe('cta/ritual-panels', () => {
  it('has four numbered panels, one h2 and a WhatsApp CTA', async () => {
    const root = await render();
    expect(root.id).toBe('ritual');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const steps = root.querySelectorAll('li.lz-cta-ritual-panels__step');
    expect(steps).toHaveLength(4);
    for (const step of steps) {
      expect(step.querySelector('.lz-cta-ritual-panels__num')).not.toBeNull();
      expect(step.querySelector('h3')?.textContent?.length).toBeGreaterThan(3);
      expect(
        step.querySelector('.lz-cta-ritual-panels__duration')?.textContent,
      ).toMatch(/min/);
    }
    expect(
      root.querySelector('a.lz-cta-ritual-panels__cta')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
  });

  it('drops optional pieces when the copy has none', async () => {
    const root = await render({
      kicker: '',
      summary: '',
      secondaryCta: '',
      steps: [{ title: 'Uno', text: 'Primer paso de ejemplo.' }],
    });
    expect(root.querySelector('.lz-cta-ritual-panels__kicker')).toBeNull();
    expect(root.querySelector('.lz-cta-ritual-panels__summary')).toBeNull();
    expect(root.querySelector('.lz-cta-ritual-panels__secondary')).toBeNull();
    expect(root.querySelector('.lz-cta-ritual-panels__duration')).toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
  });

  it('numbers with a CSS counter, uses tokens only and breaks at 992/480', () => {
    const sheet = css();
    expect(sheet).toMatch(/counter-increment: lz-ritual-step/);
    expect(sheet).toMatch(/repeat\(4,/);
    expect(sheet).toMatch(/max-width: 992px/);
    expect(sheet).toMatch(/max-width: 480px/);
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });

  it('is static: no script, form or inline style', async () => {
    expect(
      (await render()).querySelector('script, [style], iframe, form'),
    ).toBeNull();
  });
});
