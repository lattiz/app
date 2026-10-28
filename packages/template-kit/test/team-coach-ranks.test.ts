import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** Coaches with a rank bar, rebuilt from Stitch (academia-combate coaches). */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('team', 'coach-ranks');
  const giro = copySource('team', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('team', 'coach-ranks'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('team', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('team', 'coach-ranks'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('team/coach-ranks', () => {
  it('renders four coaches with photo, rank bar and data-steps', async () => {
    const root = await render();
    expect(root.id).toBe('equipo');
    expect(root.getAttribute('data-lz-variant')).toBe('coach-ranks');
    const members = root.querySelectorAll('.lz-team-coach-ranks__member');
    expect(members).toHaveLength(4);
    const first = members[0];
    const img = first.querySelector('img');
    expect(img?.getAttribute('width')).toBe('800');
    expect(img?.getAttribute('height')).toBe('1000');
    expect(img?.getAttribute('alt')?.length).toBeGreaterThan(3);
    const bar = first.querySelector('.lz-team-coach-ranks__bar');
    expect(bar).toBeTruthy();
    expect(bar?.getAttribute('data-tone')).toBe('dark');
    expect(bar?.getAttribute('data-steps')).toBe('2');
    expect(first.querySelector('.lz-team-coach-ranks__rank')?.textContent).toMatch(
      /dan/i,
    );
    expect(
      members[1].querySelector('.lz-team-coach-ranks__bar')?.getAttribute(
        'data-tone',
      ),
    ).toBe('mid');
    expect(
      members[3].querySelector('.lz-team-coach-ranks__bar')?.getAttribute(
        'data-tone',
      ),
    ).toBe('light');
  });

  it('drops optional intro, rank and specialty per member', async () => {
    const root = await render({
      intro: '',
      members: [
        {
          name: 'Ramón Ortega',
          role: 'Box',
          bio: 'Arma las clases de principiantes y corrige de a uno.',
          image: 'team-1.jpg',
          imageAlt: 'Retrato de Ramón Ortega',
        },
      ],
    });
    expect(root.querySelector('.lz-team-coach-ranks__intro')).toBeNull();
    expect(root.querySelector('.lz-team-coach-ranks__grade')).toBeNull();
    expect(root.querySelector('.lz-team-coach-ranks__specialty')).toBeNull();
    expect(root.querySelectorAll('.lz-team-coach-ranks__member')).toHaveLength(
      1,
    );
  });

  it('keeps tokens only, no gradients, and only 992/480 breakpoints', () => {
    const sheet = css();
    expect(sheet).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|gradient\(/,
    );
    expect(sheet).toMatch(/max-width:992px/);
    expect(sheet).toMatch(/max-width:480px/);
    expect(sheet).toMatch(/data-steps/);
    expect(sheet).toMatch(/data-tone/);
  });

  it('is static: no script, form or inline style', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
