import { describe, expect, it } from 'vitest';
import type { Business } from '../src/types';
import {
  interpolate,
  mapsEmbedUrl,
  mapsLinkUrl,
  renderSection,
} from '../src/lib/content';

const business: Business = {
  name: 'Barbería Uno',
  shortName: 'UNO',
  tagline: 'Club',
  city: 'CDMX',
  phone: '+52 55 1234 5678',
  whatsapp: '5215512345678',
  whatsappMessage: 'Hola, quiero una cita',
  address: 'Calle 1, CDMX',
  year: '2026',
  instagramUrl: 'https://instagram.com/uno',
  tiktokUrl: 'https://tiktok.com',
  facebookUrl: 'https://facebook.com',
  googleReviewsUrl: 'https://g.co/uno',
};
const ctx = { business, source: 'test.html' };

describe('interpolate', () => {
  it('replaces business variables and builds wa.me links', () => {
    expect(interpolate('{{name}} · {{phone}} · {{address}}', ctx)).toBe(
      'Barbería Uno · +52 55 1234 5678 · Calle 1, CDMX',
    );
    expect(interpolate('{{whatsappUrl}}', ctx)).toBe(
      'https://wa.me/5215512345678?text=Hola%2C%20quiero%20una%20cita',
    );
    expect(interpolate('{{whatsappUrl:Promo martes}}', ctx)).toBe(
      'https://wa.me/5215512345678?text=Promo%20martes',
    );
  });

  it('fails on unknown variables and on {{index}} outside numbered sections', () => {
    expect(() => interpolate('{{nope}}', ctx)).toThrow(/unknown variable/);
    expect(() => interpolate('{{index}}', ctx)).toThrow(/numbered/);
    expect(interpolate('{{index}} — X', { ...ctx, index: '03' })).toBe(
      '03 — X',
    );
  });

  it('encodes map URLs like Google share links', () => {
    expect(mapsLinkUrl('Coyoacán CDMX')).toBe(
      'https://maps.google.com/?q=Coyoac%C3%A1n+CDMX',
    );
    expect(mapsEmbedUrl('Condesa CDMX')).toBe(
      'https://www.google.com/maps?q=Condesa%20CDMX&output=embed',
    );
  });
});

describe('renderSection', () => {
  const html = `<section data-lz-slot="x" data-lz-variant="y" data-lz-attr-aria-label="label">
  <h2 data-lz-key="title"></h2>
  <ul><li data-lz-each="items"><a data-lz-attr-href="href" data-lz-key="label"></a><span data-lz-each="tags" data-lz-key="."></span></li></ul>
  <div><template data-lz-each="words"><b data-lz-key="."></b><i>·</i></template></div>
  <p data-lz-if="note" data-lz-key="note"></p>
  <a href="{{whatsappUrl}}" data-lz-key="cta"></a>
</section>`;

  it('applies keys, attributes, lists, templates, conditions and variables', () => {
    const root = renderSection(
      html,
      {
        label: 'Sección',
        title: 'Hola <em>{{shortName}}</em>',
        cta: 'Reservar',
        items: [
          { label: 'Uno', href: '#uno', tags: ['a', 'b'] },
          { label: 'Dos', href: '#dos', tags: [] },
        ],
        words: ['x', 'y'],
      },
      ctx,
    );
    expect(root.getAttribute('aria-label')).toBe('Sección');
    expect(root.querySelector('h2')?.innerHTML).toBe('Hola <em>UNO</em>');
    expect(
      [...root.querySelectorAll('li a')].map(
        (a) => `${a.getAttribute('href')}=${a.textContent}`,
      ),
    ).toEqual(['#uno=Uno', '#dos=Dos']);
    expect(root.querySelectorAll('li:first-child span').length).toBe(2);
    expect(root.querySelector('div')?.innerHTML).toBe(
      '<b>x</b><i>·</i><b>y</b><i>·</i>',
    );
    expect(root.querySelector('p')).toBeNull();
    expect(root.querySelector('a[href^="https://wa.me"]')?.textContent).toBe(
      'Reservar',
    );
    expect(root.outerHTML).not.toMatch(/data-lz-(key|each|if|attr)/);
  });

  it('fails loudly on missing content', () => {
    expect(() =>
      renderSection(html, { label: 'x', items: [], words: [], cta: 'c' }, ctx),
    ).toThrow(/"title" is missing/);
  });
});
