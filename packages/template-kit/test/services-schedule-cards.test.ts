import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** Parrilla de clases + planes, rebuilt from Stitch (gimnasio-pulso-parrilla-01). */
async function render(extra: ContentObject = {}, withSample = true) {
  const meta = await loadSectionMeta('services', 'schedule-cards');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('services', 'schedule-cards'),
    'section.html',
  );
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('services', giro, business, 'demo', {
      ...(withSample ? meta.sample : {}),
      ...extra,
    }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('services', 'schedule-cards'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('services/schedule-cards', () => {
  it('renders four class cards with zone tag, name, text and day/time rows', async () => {
    const root = await render();
    expect(root.classList.contains('lz-services-schedule-cards')).toBe(true);
    expect(root.querySelectorAll('h2').length).toBeGreaterThanOrEqual(2);
    const cards = root.querySelectorAll('article.lz-services-schedule-cards__card');
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(
        card.querySelector('.lz-services-schedule-cards__tag')?.textContent,
      ).toMatch(/zona/i);
      expect(card.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
      expect(
        card.querySelectorAll('.lz-services-schedule-cards__slot').length,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders three plans, highlights the one with a badge, and links to WhatsApp', async () => {
    const root = await render();
    const plans = root.querySelectorAll('article.lz-services-schedule-cards__plan');
    expect(plans).toHaveLength(3);
    expect(
      root.querySelectorAll('.lz-services-schedule-cards__badge'),
    ).toHaveLength(1);
    for (const plan of plans) {
      expect(plan.querySelector('h3')?.textContent?.length).toBeGreaterThan(1);
      expect(
        plan.querySelector('.lz-services-schedule-cards__price')?.textContent,
      ).toMatch(/\$/);
      expect(
        plan.querySelectorAll('.lz-services-schedule-cards__features li')
          .length,
      ).toBe(3);
      expect(
        plan
          .querySelector('a.lz-services-schedule-cards__pick')
          ?.getAttribute('href'),
      ).toMatch(/wa\.me/);
    }
  });

  it('drops optional pieces when the copy has none', async () => {
    const root = await render({
      plans: { title: 'Planes' },
      prices: [{ name: 'Día', price: '$80', description: 'Pase del día' }],
      promos: [
        {
          tag: 'Zona 01',
          title: 'Fuerza',
          text: 'Pesas libres y racks.',
          cta: 'Reservar',
          href: '{{whatsappUrl:Hola, quiero reservar}}',
        },
      ],
    });
    expect(root.querySelector('.lz-services-schedule-cards__badge')).toBeNull();
    expect(
      root.querySelector('.lz-services-schedule-cards__features'),
    ).toBeNull();
    expect(root.querySelector('.lz-services-schedule-cards__slots')).toBeNull();
    expect(root.querySelector('a.lz-services-schedule-cards__pick')).toBeNull();
    expect(root.querySelector(NO_JS)).toBeNull();
  });

  it('uses only theme tokens, reduced motion and a gzip budget', () => {
    const sheet = css();
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(sheet).toMatch(/var\(--lz-color-accent\)/);
    expect(sheet).toMatch(/prefers-reduced-motion/);
    expect(sheet).toMatch(/max-width: 992px/);
    expect(sheet).toMatch(/max-width: 480px/);
    expect(gzipSync(sheet).length).toBeLessThan(1229);
  });
});
