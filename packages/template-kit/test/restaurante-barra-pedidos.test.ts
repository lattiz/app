import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The six sections rebuilt from Stitch (restaurante-barra-pedidos-01). */
async function render(slot: string, variant: string, extra: ContentObject = {}) {
  const meta = await loadSectionMeta(slot, variant);
  const giro = copySource(slot, meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir(slot, variant), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData(slot, giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(slot: string, variant: string): string {
  return readFileSync(resolve(sectionDir(slot, variant), 'section.css'), 'utf8');
}

const NO_JS = 'script, [style], iframe, form';
const TOKENS_ONLY = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/;

describe.each([
  ['hero', 'ticket-board'],
  ['about', 'order-steps'],
  ['services', 'menu-leaders'],
  ['cta', 'aside-note'],
  ['cta', 'closing-band'],
  ['footer', 'hours-blocks'],
])('%s/%s', (slot, variant) => {
  it('keeps the no-JS and token-only contract', async () => {
    expect((await render(slot, variant)).querySelector(NO_JS)).toBeNull();
    expect(css(slot, variant)).not.toMatch(TOKENS_ONLY);
  });
});

describe('hero/ticket-board', () => {
  it('has one h1, a WhatsApp CTA first, the LCP photo and a ticket with its lines', async () => {
    const root = await render('hero', 'ticket-board');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(
      root.querySelector('.lz-hero-ticket-board__actions a')?.getAttribute('href'),
    ).toMatch(/wa\.me/);
    const img = root.querySelector('img.lz-hero-ticket-board__image');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    expect(img?.hasAttribute('loading')).toBe(false);
    expect(root.querySelectorAll('.lz-hero-ticket-board__line')).toHaveLength(3);
  });

  it('drops the ticket and the note when the copy has none', async () => {
    const root = await render('hero', 'ticket-board', {
      ticketTitle: '',
      note: '',
      secondaryCta: '',
    });
    expect(root.querySelector('.lz-hero-ticket-board__ticket')).toBeNull();
    expect(root.querySelector('.lz-hero-ticket-board__note')).toBeNull();
    expect(root.querySelector('.lz-hero-ticket-board__link')).toBeNull();
  });
});

describe('about/order-steps', () => {
  it('renders one numbered step per feature and an optional CTA', async () => {
    const root = await render('about', 'order-steps');
    expect(root.querySelectorAll('.lz-about-order-steps__step')).toHaveLength(3);
    expect(root.querySelector('.lz-about-order-steps__cta')).not.toBeNull();
    const bare = await render('about', 'order-steps', { cta: '', kicker: '' });
    expect(bare.querySelector('.lz-about-order-steps__cta')).toBeNull();
    expect(bare.querySelector('.lz-about-order-steps__kicker')).toBeNull();
  });
});

describe('services/menu-leaders', () => {
  it('renders groups with dot-leader lines and skips missing thumbnails', async () => {
    const root = await render('services', 'menu-leaders');
    expect(root.querySelectorAll('.lz-services-menu-leaders__group')).toHaveLength(2);
    expect(root.querySelectorAll('.lz-services-menu-leaders__item')).toHaveLength(5);
    expect(root.querySelectorAll('.lz-services-menu-leaders__dots')).toHaveLength(5);
    expect(root.querySelector('img.lz-services-menu-leaders__thumb')).toBeNull();
  });
});

describe('cta/aside-note', () => {
  it('has the stock line, two blocks and a WhatsApp link; notes are optional', async () => {
    const root = await render('cta', 'aside-note');
    expect(root.querySelectorAll('.lz-cta-aside-note__block')).toHaveLength(2);
    expect(root.querySelectorAll('.lz-cta-aside-note__notes')).toHaveLength(1);
    expect(root.querySelector('.lz-cta-aside-note__cta')?.getAttribute('href')).toMatch(/wa\.me/);
    expect((await render('cta', 'aside-note', { stock: '' })).querySelector('.lz-cta-aside-note__stock')).toBeNull();
  });
});

describe('cta/closing-band', () => {
  it('has a title, a WhatsApp button and optional kicker, text and note', async () => {
    const root = await render('cta', 'closing-band');
    expect(root.querySelector('.lz-cta-closing-band__button')?.getAttribute('href')).toMatch(/wa\.me/);
    const bare = await render('cta', 'closing-band', { kicker: '', text: '', note: '' });
    expect(bare.querySelector('.lz-cta-closing-band__kicker')).toBeNull();
    expect(bare.querySelector('.lz-cta-closing-band__text')).toBeNull();
    expect(bare.querySelector('.lz-cta-closing-band__note')).toBeNull();
  });
});

describe('footer/hours-blocks', () => {
  it('has the brand, three blocks and the legal line; the blurb is optional', async () => {
    const root = await render('footer', 'hours-blocks');
    expect(root.querySelectorAll('.lz-footer-hours-blocks__block')).toHaveLength(3);
    expect(root.querySelectorAll('.lz-footer-hours-blocks__row')).toHaveLength(3);
    expect(root.querySelector('.lz-footer-hours-blocks__legal')?.textContent).toMatch(/©/);
    expect((await render('footer', 'hours-blocks', { about: '' })).querySelector('.lz-footer-hours-blocks__about')).toBeNull();
  });
});
