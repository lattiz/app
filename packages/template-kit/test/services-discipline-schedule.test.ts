import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** Weekly class matrix rebuilt from Stitch (academia-combate horario): hour × day + plans. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'discipline-schedule');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(
    sectionDir('services', 'discipline-schedule'),
    'section.html',
  );
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('services', giro, business, 'demo', {
      ...meta.sample,
      ...extra,
    }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('services', 'discipline-schedule'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('services/discipline-schedule', () => {
  it('renders a 4×6 matrix, empty Saturday cells, a featured plan and WhatsApp CTAs', async () => {
    const root = await render();
    expect(root.id).toBe('servicios');
    expect(root.getAttribute('data-lz-variant')).toBe('discipline-schedule');
    expect(root.classList.contains('lz-services-discipline-schedule')).toBe(
      true,
    );
    const rows = root.querySelectorAll('tr.lz-ds__row');
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(row.querySelectorAll('td.lz-ds__cell')).toHaveLength(6);
    }
    expect(
      root.querySelectorAll('.lz-ds__cell:not(:has(.lz-ds__disc))'),
    ).toHaveLength(2);
    const plans = root.querySelectorAll('article.lz-ds__plan');
    expect(plans).toHaveLength(3);
    expect(plans[1].querySelector('.lz-ds__badge')?.textContent).toBeTruthy();
    expect(plans[0].querySelector('.lz-ds__badge')).toBeNull();
    expect(plans[1].querySelector('a.lz-ds__cta')?.getAttribute('href')).toMatch(
      /wa\.me/,
    );
    expect(
      root.querySelector('a.lz-ds__trial-cta')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
  });

  it('keeps tokens only, no gradients, and only 992/480 breakpoints', () => {
    const sheet = css();
    expect(sheet).not.toMatch(
      /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|gradient\(/,
    );
    expect(sheet).toMatch(/max-width:992px/);
    expect(sheet).toMatch(/max-width:480px/);
  });

  it('drops optional legend, note, trial, plans and empty cells stay in the matrix', async () => {
    const root = await render({
      intro: '',
      legend: [],
      note: '',
      trial: '',
      prices: [],
      promos: [],
      plans: {},
    });
    expect(root.querySelector('.lz-ds__legend')).toBeNull();
    expect(root.querySelector('.lz-ds__note')).toBeNull();
    expect(root.querySelector('.lz-ds__trial')).toBeNull();
    expect(root.querySelector('.lz-ds__plans')).toBeNull();
    expect(root.querySelectorAll('tr.lz-ds__row')).toHaveLength(4);
  });

  it('is static: no script, form or inline style', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
