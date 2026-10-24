import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The ten sections rebuilt from Stitch (restaurante-ceniza-*-01 candidates). */
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
// The navbar family carries the translucent blur of every navbar variant.
const TOKENS_NAVBAR = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(/;

describe.each([
  ['navbar', 'index-strip'],
  ['hero', 'vertical-slip'],
  ['hero', 'split-mosaic'],
  ['about', 'coal-log'],
  ['services', 'chalk-board'],
  ['faq', 'rule-table'],
  ['gallery', 'contact-sheet'],
  ['testimonials', 'order-slips'],
  ['locations', 'table-map'],
  ['footer', 'receipt'],
])('%s/%s', (slot, variant) => {
  it('keeps the no-JS and token-only contract', async () => {
    expect((await render(slot, variant)).querySelector(NO_JS)).toBeNull();
    expect(css(slot, variant)).not.toMatch(slot === 'navbar' ? TOKENS_NAVBAR : TOKENS_ONLY);
  });
});

describe('navbar/index-strip', () => {
  it('has the strip, the numbered links and both menu toggles', async () => {
    const root = await render('navbar', 'index-strip');
    expect(root.querySelector('.lz-navbar-index-strip__strip')).not.toBeNull();
    expect(root.querySelectorAll('.lz-navbar-index-strip__list li').length).toBeGreaterThan(0);
    expect(root.querySelector('a[href="#menu"]')).not.toBeNull();
    expect((await render('navbar', 'index-strip', { hours: '' })).querySelector('.lz-navbar-index-strip__hours')).toBeNull();
  });
});

describe('hero/vertical-slip', () => {
  it('has one h1, the LCP photo and the slip; the slip is optional', async () => {
    const root = await render('hero', 'vertical-slip');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
    expect(root.hasAttribute('data-lz-fit')).toBe(true);
    expect(root.querySelectorAll('.lz-hero-vertical-slip__slip-list li')).toHaveLength(2);
    const bare = await render('hero', 'vertical-slip', { slipTitle: '', tag: '', note: '' });
    expect(bare.querySelector('.lz-hero-vertical-slip__slip')).toBeNull();
    expect(bare.querySelector('.lz-hero-vertical-slip__tag')).toBeNull();
  });
});

describe('hero/split-mosaic', () => {
  it('has one h1, a WhatsApp CTA, the LCP photo and the extra tiles', async () => {
    const root = await render('hero', 'split-mosaic');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('.lz-hero-split-mosaic__cta')?.getAttribute('href')).toMatch(/wa\.me/);
    expect(root.querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
    expect(root.querySelectorAll('.lz-hero-split-mosaic__tile')).toHaveLength(4);
    expect((await render('hero', 'split-mosaic', { tiles: [] })).querySelectorAll('.lz-hero-split-mosaic__tile')).toHaveLength(1);
  });
});

describe('about/coal-log', () => {
  it('renders one cell per stage with its time and optional note', async () => {
    const root = await render('about', 'coal-log');
    expect(root.querySelectorAll('.lz-about-coal-log__stage')).toHaveLength(4);
    expect(root.querySelectorAll('.lz-about-coal-log__time')).toHaveLength(4);
    expect(root.querySelectorAll('.lz-about-coal-log__stage-note')).toHaveLength(4);
  });
});

describe('services/chalk-board', () => {
  it('renders three groups with prices and optional descriptions', async () => {
    const root = await render('services', 'chalk-board');
    expect(root.querySelectorAll('.lz-services-chalk-board__group')).toHaveLength(3);
    expect(root.querySelectorAll('.lz-services-chalk-board__price')).toHaveLength(6);
    expect(root.querySelectorAll('.lz-services-chalk-board__desc')).toHaveLength(5);
  });
});

describe('faq/rule-table', () => {
  it('uses open details rows with topic, question and answer', async () => {
    const root = await render('faq', 'rule-table');
    const rows = root.querySelectorAll('details[open].lz-faq-rule-table__row');
    expect(rows.length).toBeGreaterThan(0);
    expect(root.querySelectorAll('summary')).toHaveLength(rows.length);
    expect(root.querySelector('.lz-faq-rule-table__topic')?.textContent).toMatch(/\S/);
  });
});

describe('gallery/contact-sheet', () => {
  it('renders sized lazy frames with captions inside the sheet', async () => {
    const root = await render('gallery', 'contact-sheet');
    const img = root.querySelector('img.lz-gallery-contact-sheet__image');
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('width')).toBe('1200');
    expect(root.querySelectorAll('.lz-gallery-contact-sheet__frame').length).toBeGreaterThan(0);
    expect((await render('gallery', 'contact-sheet', { sheetLabel: '' })).querySelector('.lz-gallery-contact-sheet__strip')).toBeNull();
  });
});

describe('testimonials/order-slips', () => {
  it('renders one slip per review with its optional stamp', async () => {
    const root = await render('testimonials', 'order-slips');
    expect(root.querySelectorAll('.lz-testimonials-order-slips__slip')).toHaveLength(3);
    expect(root.querySelectorAll('.lz-testimonials-order-slips__stamp')).toHaveLength(1);
    expect(root.querySelectorAll('blockquote')).toHaveLength(3);
  });
});

describe('locations/table-map', () => {
  it('has the plan, the zone legend, the schedule and the three channels', async () => {
    const root = await render('locations', 'table-map');
    expect(root.getAttribute('id')).toBe('sucursales');
    const body = root.querySelector('.lz-locations-table-map__body')!;
    expect(body.querySelector('svg')).not.toBeNull();
    expect(body.querySelectorAll('.lz-locations-table-map__zone-item')).toHaveLength(4);
    expect(body.querySelectorAll('.lz-locations-table-map__row')).toHaveLength(3);
    expect(body.querySelectorAll('.lz-locations-table-map__channel')).toHaveLength(3);
  });
});

describe('footer/receipt', () => {
  it('renders the lines, the total and the legal line; the stamp is optional', async () => {
    const root = await render('footer', 'receipt');
    expect(root.querySelectorAll('.lz-footer-receipt__line')).toHaveLength(3);
    expect(root.querySelector('.lz-footer-receipt__total')?.textContent).toMatch(/\S/);
    expect(root.querySelector('.lz-footer-receipt__year')?.textContent).toMatch(/©/);
    expect((await render('footer', 'receipt', { stamp: '', cut: '' })).querySelector('.lz-footer-receipt__stamp')).toBeNull();
  });
});
