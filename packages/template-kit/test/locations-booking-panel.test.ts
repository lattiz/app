import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';

/** The contact rebuilt from Stitch (barberia-don-porfirio-01): one framed card, three channels and a location panel. */
async function render() {
  const meta = await loadSectionMeta('locations', 'booking-panel');
  const giro = copySource('locations', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('locations', 'booking-panel'),
    'section.html',
  );
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('locations', giro, business, 'demo', meta.sample),
    { business, index: '07', source: file },
  );
}

describe('locations/booking-panel', () => {
  it('has the reference anatomy: three contact channels, a primary WhatsApp button and a branch panel', async () => {
    const root = await render();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const channels = root.querySelectorAll(
      '.lz-locations-booking-panel__channel',
    );
    expect(channels).toHaveLength(3);
    expect(channels[0].getAttribute('href')).toMatch(/wa\.me/);
    expect(channels[1].getAttribute('href')).toMatch(/^tel:/);
    expect(channels[2].getAttribute('href')).toMatch(/^mailto:/);
    expect(
      root.querySelector('a.lz-button--primary')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
    const branch = root.querySelector('.lz-locations-booking-panel__branch');
    expect(
      branch?.querySelector('.lz-locations-booking-panel__address')?.textContent
        ?.length,
    ).toBeGreaterThan(8);
    expect(
      branch?.querySelector('.lz-locations-booking-panel__hours')?.textContent
        ?.length,
    ).toBeGreaterThan(3);
  });

  it('has no form or embedded map: the section reserves by WhatsApp', async () => {
    const root = await render();
    expect(root.querySelector('form, iframe, script, [style]')).toBeNull();
  });

  it('uses theme tokens only', () => {
    const css = readFileSync(
      resolve(sectionDir('locations', 'booking-panel'), 'section.css'),
      'utf8',
    );
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });
});
