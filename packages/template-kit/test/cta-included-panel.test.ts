import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** Dark order band rebuilt from Stitch (restaurante-trigo-brasa-tandas-01): copy + "what's included" panel. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('cta', 'included-panel');
  const giro = copySource('cta', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('cta', 'included-panel'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('cta', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '05', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('cta', 'included-panel'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('cta/included-panel', () => {
  it('has the reference anatomy: kicker, h2, text, WhatsApp button and a checklist panel', async () => {
    const root = await render();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(root.querySelector('.lz-cta-included-panel__kicker')).not.toBeNull();
    expect(
      root.querySelector('a.lz-cta-included-panel__cta')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
    expect(root.querySelector('h3')?.textContent).toMatch(/incluye/i);
    const items = root.querySelectorAll('.lz-cta-included-panel__item');
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(item.textContent?.trim().length).toBeGreaterThan(5);
    }
  });

  it('drops the panel, kicker and secondary link when the copy has none', async () => {
    const root = await render({ items: [], kicker: '', secondaryCta: '' });
    expect(root.querySelector('.lz-cta-included-panel__panel')).toBeNull();
    expect(root.querySelector('.lz-cta-included-panel__kicker')).toBeNull();
    expect(root.querySelector('.lz-cta-included-panel__more')).toBeNull();
    expect(root.querySelector('a.lz-cta-included-panel__cta')).not.toBeNull();
  });

  it('keeps the no-JS, token-only and budget contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    const sheet = css();
    expect(sheet).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter|@keyframes/,
    );
    expect(gzipSync(sheet).length).toBeLessThan(1400);
  });
});
