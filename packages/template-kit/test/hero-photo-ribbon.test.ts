import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';

/** Fidelity of the hand-rebuilt hero against the Stitch design it came from (barberia-don-porfirio-01). */
async function render() {
  const meta = await loadSectionMeta('hero', 'photo-ribbon');
  const giro = copySource('hero', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('hero', 'photo-ribbon'), 'section.html');
  return {
    meta,
    root: await renderSection(
      readFileSync(file, 'utf8'),
      sectionData('hero', giro, business, 'demo', meta.sample),
      { business, index: '01', source: file },
    ),
  };
}

describe('hero/photo-ribbon (Stitch: full-bleed photo, veil, badge, WhatsApp CTA)', () => {
  it('keeps every piece of the Stitch hero as native markup', async () => {
    const { root } = await render();
    expect(
      root.querySelector('.lz-hero-photo-ribbon__media img'),
    ).not.toBeNull();
    expect(root.querySelector('.lz-hero-photo-ribbon__veil')).not.toBeNull();
    expect(
      root.querySelectorAll('.lz-hero-photo-ribbon__stripes i'),
    ).toHaveLength(3);
    expect(
      root.querySelector('.lz-hero-photo-ribbon__chip-text')?.textContent
        ?.length,
    ).toBeGreaterThan(3);
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    const first = root.querySelector('a');
    expect(first?.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//);
    expect(first?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(
      root.querySelector('.lz-hero-photo-ribbon__note')?.textContent,
    ).toMatch(/Respuesta/);
  });

  it('is LCP-safe and JS-free: sized priority photo, no script, no inline style, no remote URL', async () => {
    const { root } = await render();
    const img = root.querySelector('img')!;
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.hasAttribute('loading')).toBe(false);
    expect(img.getAttribute('width')).toMatch(/^\d+$/);
    expect(img.getAttribute('height')).toMatch(/^\d+$/);
    expect(root.querySelector('script, [style], iframe, form')).toBeNull();
    expect(root.outerHTML).not.toMatch(
      /googleusercontent|aida-public|https?:\/\/(?!wa\.me)/,
    );
  });

  it('serves Basic and Pro (the tier decides Motion, not the markup)', async () => {
    const { meta } = await render();
    expect(meta.tiers).toEqual(['basic', 'pro']);
  });

  it('stays budgeted: token-only CSS, no literal colors, small', () => {
    const css = readFileSync(
      resolve(sectionDir('hero', 'photo-ribbon'), 'section.css'),
      'utf8',
    );
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(css).toMatch(/prefers-reduced-motion/);
    expect(gzipSync(css).length).toBeLessThan(2000);
  });
});
