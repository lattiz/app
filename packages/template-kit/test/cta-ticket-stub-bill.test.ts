import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The weekly bill rebuilt as concert tickets (restaurante-la-nota-azul-captura-01). */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('cta', 'ticket-stub-bill');
  const giro = copySource('cta', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('cta', 'ticket-stub-bill'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('cta', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('cta', 'ticket-stub-bill'), 'section.css'),
    'utf8',
  );
}

describe('cta/ticket-stub-bill', () => {
  it('renders one h2 and a ticket per show with stub, time, name and reserve link', async () => {
    const root = await render();
    expect(root.id).toBe('cartelera');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const shows = root.querySelectorAll('li.lz-cta-ticket-stub-bill__show');
    expect(shows).toHaveLength(3);
    for (const show of shows) {
      expect(show.querySelector('.lz-cta-ticket-stub-bill__day')).not.toBeNull();
      expect(show.querySelector('.lz-cta-ticket-stub-bill__time')).not.toBeNull();
      expect(show.querySelector('h3')?.textContent?.length).toBeGreaterThan(3);
      expect(
        show.querySelector('a.lz-cta-ticket-stub-bill__reserve')?.getAttribute('href'),
      ).toMatch(/wa\.me/);
    }
    expect(root.querySelectorAll('.lz-cta-ticket-stub-bill__badge')).toHaveLength(1);
  });

  it('drops the list and optional pieces when the copy has none', async () => {
    const root = await render({ shows: [], kicker: '', text: '', secondaryCta: '' });
    expect(root.querySelector('.lz-cta-ticket-stub-bill__list')).toBeNull();
    expect(root.querySelector('.lz-cta-ticket-stub-bill__kicker')).toBeNull();
    expect(root.querySelector('.lz-cta-ticket-stub-bill__text')).toBeNull();
    expect(root.querySelectorAll('a.lz-button')).toHaveLength(1);
  });

  it('is static, perforated with tokens and free of literal colors', async () => {
    expect((await render()).querySelector('script, [style], iframe, form')).toBeNull();
    const sheet = css();
    expect(sheet).toMatch(/2px dashed var\(--lz-color-line/);
    expect(sheet).toMatch(/::before/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|gradient|backdrop-filter|@keyframes/);
  });
});
