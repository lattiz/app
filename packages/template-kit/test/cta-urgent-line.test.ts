import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The urgency band rebuilt from Stitch (veterinaria-editorial-agenda-01): dark full-width line, phone as tel:. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('cta', 'urgent-line');
  const giro = copySource('cta', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('cta', 'urgent-line'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('cta', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('cta', 'urgent-line'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('cta/urgent-line', () => {
  it('has the reference anatomy: badge, h2, text, hours, phone tel: and call button', async () => {
    const root = await render();
    expect(root.id).toBe('urgencias');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(
      root.querySelector('.lz-cta-urgent-line__badge')?.textContent,
    ).toMatch(/Urgencias/);
    expect(
      root.querySelector('.lz-cta-urgent-line__text')?.textContent?.length,
    ).toBeGreaterThan(20);
    expect(root.querySelectorAll('.lz-cta-urgent-line__hour')).toHaveLength(2);
    const phone = root.querySelector('a.lz-cta-urgent-line__phone');
    expect(phone?.getAttribute('href')).toMatch(/^tel:/);
    expect(phone?.textContent).toMatch(/\d/);
    expect(
      root.querySelector('a.lz-cta-urgent-line__call')?.getAttribute('href'),
    ).toMatch(/^tel:/);
  });

  it('drops the optional badge, hours and secondary CTA when the copy has none', async () => {
    const root = await render({
      badge: '',
      hours: [],
      secondaryCta: '',
      phoneLabel: '',
    });
    expect(root.querySelector('.lz-cta-urgent-line__badge')).toBeNull();
    expect(root.querySelector('.lz-cta-urgent-line__hours')).toBeNull();
    expect(root.querySelector('.lz-cta-urgent-line__wa')).toBeNull();
    expect(root.querySelector('.lz-cta-urgent-line__phone-label')).toBeNull();
    expect(root.querySelector('a.lz-cta-urgent-line__call')).not.toBeNull();
  });

  it('keeps the no-JS and token-only contract, with no ping animation', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).toMatch(/prefers-reduced-motion/);
    expect(css()).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter|animate-ping|@keyframes/,
    );
    expect(css()).toMatch(/grid-template-columns: repeat\(12,/);
  });
});
