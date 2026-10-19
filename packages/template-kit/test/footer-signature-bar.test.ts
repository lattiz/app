import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';

/** The footer rebuilt from Stitch (barberia-don-porfirio-01): brand + motto over anchors + legal. */
async function render() {
  const meta = await loadSectionMeta('footer', 'signature-bar');
  const giro = copySource('footer', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('footer', 'signature-bar'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('footer', giro, business, 'demo', meta.sample),
    { business, index: '', source: file },
  );
}

describe('footer/signature-bar', () => {
  it('has the reference anatomy: monogram + name, motto with ribbon, anchors, legal line', async () => {
    const root = await render();
    expect(
      root.querySelector('.lz-footer-signature-bar__monogram')?.textContent,
    ).toBe('DP');
    expect(
      root.querySelector('.lz-footer-signature-bar__name')?.textContent?.length,
    ).toBeGreaterThan(2);
    expect(
      root.querySelector('.lz-footer-signature-bar__ribbon'),
    ).not.toBeNull();
    expect(
      root.querySelectorAll('.lz-footer-signature-bar__link').length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      root.querySelector('.lz-footer-signature-bar__legal')?.textContent,
    ).toMatch(/©.*Hecho con Lattiz/);
  });

  it('keeps no form or script, and the ribbon is decoration built from theme tokens', async () => {
    const root = await render();
    expect(root.querySelector('script, [style], iframe, form')).toBeNull();
    const css = readFileSync(
      resolve(sectionDir('footer', 'signature-bar'), 'section.css'),
      'utf8',
    );
    expect(css).toMatch(/repeating-linear-gradient/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });
});
