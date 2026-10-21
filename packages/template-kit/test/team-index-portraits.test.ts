import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The team rebuilt from Stitch (barberia-abeto-indice-01): tall 3:4 portraits in ruled frames. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('team', 'index-portraits');
  const giro = copySource('team', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('team', 'index-portraits'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('team', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('team', 'index-portraits'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';
const TOKENS_ONLY = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/;

describe('team/index-portraits', () => {
  it('renders a framed portrait, role, name and tags per member', async () => {
    const root = await render({
      members: [
        {
          name: 'Julián Arriola',
          role: 'Maestro barbero',
          tags: ['Navaja recta', 'Corte clásico'],
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Julián',
        },
        {
          name: 'Mateo Rivas',
          role: 'Barbero',
          tags: ['Barba'],
          image: 'team-2.jpg',
          imageAlt: 'Retrato de Mateo',
        },
      ],
    });
    const members = root.querySelectorAll('.lz-team-index-portraits__member');
    expect(members).toHaveLength(2);
    expect(
      members[0].querySelectorAll('.lz-team-index-portraits__tag'),
    ).toHaveLength(2);
    const img = members[0].querySelector('img');
    expect(img?.getAttribute('width')).toBe('900');
    expect(img?.getAttribute('height')).toBe('1200');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('drops the optional intro', async () => {
    expect(
      (await render({ intro: '' })).querySelector(
        '.lz-team-index-portraits__intro',
      ),
    ).toBeNull();
  });

  it('only recolours the portrait on hover with a pointer', () => {
    const source = css();
    expect(source).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/);
    expect(source).toMatch(/prefers-reduced-motion/);
  });

  it('keeps the no-JS and token-only contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(TOKENS_ONLY);
  });
});
