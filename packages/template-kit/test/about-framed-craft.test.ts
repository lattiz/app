import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';

/** The craft section rebuilt from Stitch (barberia-don-porfirio-01, "maestros"): text + three rows, framed photo with a plate. */
async function render() {
  const meta = await loadSectionMeta('about', 'framed-craft');
  const giro = copySource('about', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('about', 'framed-craft'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('about', giro, business, 'demo', meta.sample),
    { business, index: '02', source: file },
  );
}

describe('about/framed-craft', () => {
  it('has the reference anatomy: copy, three craft rows, framed photo and plate', async () => {
    const root = await render();
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    expect(
      root.querySelectorAll('li.lz-about-framed-craft__feature'),
    ).toHaveLength(3);
    expect(
      root.querySelector('figure img')?.getAttribute('alt')?.length,
    ).toBeGreaterThan(5);
    expect(
      root.querySelector('.lz-about-framed-craft__plate-title')?.textContent
        ?.length,
    ).toBeGreaterThan(3);
  });

  it('is static: no script, form or inline style', async () => {
    const root = await render();
    expect(root.querySelector('script, [style], iframe, form')).toBeNull();
  });

  it('numbers the rows with a CSS counter and uses theme tokens only', () => {
    const css = readFileSync(
      resolve(sectionDir('about', 'framed-craft'), 'section.css'),
      'utf8',
    );
    expect(css).toMatch(/counter-increment: lz-about-feature/);
    expect(css).toMatch(/counter\(lz-about-feature, decimal-leading-zero\)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
  });
});
