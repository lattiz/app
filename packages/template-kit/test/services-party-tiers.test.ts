import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The package comparison rebuilt from Stitch (floreria-casa-confeti-salon-de-fiestas-infantiles-01): tiers with checklists, the middle one lifted. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('services', 'party-tiers');
  const giro = copySource('services', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('services', 'party-tiers'), 'section.html');
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
    resolve(sectionDir('services', 'party-tiers'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';

describe('services/party-tiers', () => {
  it('renders three tiers with name, price, checklist and a WhatsApp CTA', async () => {
    const root = await render();
    expect(root.id).toBe('servicios');
    expect(root.querySelectorAll('h2')).toHaveLength(1);
    const tiers = root.querySelectorAll(
      'article.lz-services-party-tiers__tier',
    );
    expect(tiers).toHaveLength(3);
    for (const tier of tiers) {
      expect(tier.querySelector('h3')?.textContent?.length).toBeGreaterThan(2);
      expect(
        tier.querySelector('.lz-services-party-tiers__price')?.textContent,
      ).toMatch(/\$/);
      expect(
        tier.querySelectorAll('.lz-services-party-tiers__includes li').length,
      ).toBeGreaterThanOrEqual(3);
      expect(
        tier
          .querySelector('a.lz-services-party-tiers__cta')
          ?.getAttribute('href'),
      ).toMatch(/wa\.me/);
    }
    expect(
      tiers[1].querySelector('.lz-services-party-tiers__badge')?.textContent,
    ).toBeTruthy();
    expect(
      tiers[0].querySelector('.lz-services-party-tiers__badge'),
    ).toBeNull();
  });

  it('lifts the middle of three with theme colours, no literals', () => {
    const sheet = css();
    expect(sheet).toMatch(/:nth-child\(2\):nth-last-child\(2\)/);
    expect(sheet).toMatch(/background: var\(--lz-color-text\)/);
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/);
    expect(sheet).toMatch(/max-width: 992px/);
    expect(sheet).toMatch(/max-width: 480px/);
  });

  it('degrades without checklist, extras, promos or CTA', async () => {
    const root = await render({
      cta: '',
      extras: [],
      promos: [],
      intro: '',
      prices: [
        { name: 'Uno', price: '$100', description: 'Solo uno.' },
        { name: 'Dos', price: '$200', description: 'Solo dos.' },
      ],
    });
    expect(
      root.querySelectorAll('.lz-services-party-tiers__tier'),
    ).toHaveLength(2);
    expect(root.querySelector('.lz-services-party-tiers__includes')).toBeNull();
    expect(root.querySelector('.lz-services-party-tiers__cta')).toBeNull();
    expect(root.querySelector('.lz-services-party-tiers__extras')).toBeNull();
    expect(root.querySelector('.lz-services-party-tiers__promos')).toBeNull();
    expect(root.querySelector('.lz-services-party-tiers__intro')).toBeNull();
  });

  it('is static: no script, form or inline style', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
  });
});
