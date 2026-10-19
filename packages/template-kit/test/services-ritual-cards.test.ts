import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';

/** The services rebuilt from Stitch (barberia-don-porfirio-01): split header + tariff cards with duration and action. */
async function render(withSample: boolean) {
  const meta = await loadSectionMeta('services', 'ritual-cards');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('services', 'ritual-cards'), 'section.html');
  const data = sectionData(
    'services',
    giro,
    business,
    'demo',
    withSample ? meta.sample : {},
  );
  return renderSection(readFileSync(file, 'utf8'), data, {
    business,
    index: '03',
    source: file,
  });
}

describe('services/ritual-cards', () => {
  it('has the reference anatomy: split header, cards with name+price, description and action', async () => {
    const root = await render(true);
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const cards = root.querySelectorAll('.lz-services-ritual-cards__card');
    expect(cards.length).toBeGreaterThanOrEqual(3);
    for (const card of cards) {
      const row = card.querySelector('.lz-services-ritual-cards__row');
      expect(row?.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
      expect(
        row?.querySelector('.lz-services-ritual-cards__price')?.textContent,
      ).toMatch(/\d/);
      expect(
        card.querySelector('.lz-services-ritual-cards__duration')?.textContent,
      ).toMatch(/minutos/);
      expect(
        card
          .querySelector('a.lz-services-ritual-cards__pick')
          ?.getAttribute('href'),
      ).toMatch(/wa\.me|whatsapp/);
    }
    expect(
      root.querySelectorAll('.lz-services-ritual-cards__badge'),
    ).toHaveLength(1);
    expect(
      root.querySelector('.lz-services-ritual-cards__note'),
    ).not.toBeNull();
  });

  it('drops the optional pieces when the copy has none (no empty badge, duration or note)', async () => {
    const root = await render(false);
    expect(root.querySelector('.lz-services-ritual-cards__badge')).toBeNull();
    expect(
      root.querySelector('.lz-services-ritual-cards__duration'),
    ).toBeNull();
    expect(root.querySelector('.lz-services-ritual-cards__note')).toBeNull();
    expect(root.querySelector('script, [style], iframe, form')).toBeNull();
  });

  it('uses only theme tokens', () => {
    const css = readFileSync(
      resolve(sectionDir('services', 'ritual-cards'), 'section.css'),
      'utf8',
    );
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(css).toMatch(/var\(--lz-color-accent\)/);
  });
});
