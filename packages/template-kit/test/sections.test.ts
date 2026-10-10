import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { loadContentPack } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject, ContentPack } from '../src/types';

let pack: ContentPack;
beforeAll(async () => {
  pack = await loadContentPack('barberia.oxido.es-MX');
});

function render(
  slot: string,
  variant: string,
  props: ContentObject = {},
): Element {
  const file = resolve(sectionDir(slot, variant), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    { ...pack.sections[slot], ...props },
    { business: pack.business, index: '04', source: file },
  );
}

const hrefs = (root: Element) =>
  [...root.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');

describe('faq', () => {
  it.each(['list', 'two-col'])(
    '%s renders every item as an open <details> with question and answer',
    (variant) => {
      const root = render('faq', variant);
      const items = root.querySelectorAll('details');
      expect(items.length).toBe(7);
      expect([...items].every((d) => d.hasAttribute('open'))).toBe(true);
      expect(items[0].querySelector('summary')?.textContent).toContain(
        '¿Cuánto cuesta un corte?',
      );
      expect(items[0].textContent).toContain('$270 MXN');
      expect(root.querySelector('.lz-index')?.textContent).toBe(
        '04 — Preguntas',
      );
      expect(root.querySelector('form')).toBeNull();
    },
  );

  it('two-col adds the WhatsApp CTA', () => {
    expect(hrefs(render('faq', 'two-col'))[0]).toMatch(
      /^https:\/\/wa\.me\/5215500000000\?text=Hola%2C%20tengo/,
    );
  });
});

describe('gallery', () => {
  it.each(['grid', 'strip'])(
    '%s renders 8 lazy images with alt, size and caption',
    (variant) => {
      const figures = [
        ...render('gallery', variant).querySelectorAll('figure'),
      ];
      expect(figures.length).toBe(8);
      for (const figure of figures) {
        const img = figure.querySelector('img');
        expect(img?.getAttribute('src')).toMatch(/^gallery-0\d\.jpg$/);
        expect(img?.getAttribute('alt')?.length).toBeGreaterThan(10);
        expect(img?.getAttribute('width')).toBe('1200');
        expect(img?.getAttribute('height')).toBe('1200');
        expect(img?.getAttribute('loading')).toBe('lazy');
        expect(figure.querySelector('figcaption')?.textContent).not.toBe('');
      }
    },
  );
});

describe('locations', () => {
  it('single shows one branch with WhatsApp, call and directions buttons', () => {
    const root = render('locations', 'single');
    expect(root.querySelector('h3')?.textContent).toBe('Condesa');
    expect(root.querySelectorAll('iframe').length).toBe(1);
    const links = hrefs(root);
    expect(links[0]).toMatch(/^https:\/\/wa\.me\//);
    expect(links[1]).toBe('tel:+525500000000');
    expect(links[2]).toMatch(/^https:\/\/maps\.google\.com\/\?q=Condesa/);
  });

  it('with-contact adds WhatsApp, tel and mailto channels above every branch', () => {
    const root = render('locations', 'with-contact');
    const channels = [...root.querySelectorAll('.lz-contact__channel')];
    expect(channels.map((a) => a.getAttribute('href')?.split(':')[0])).toEqual([
      'https',
      'tel',
      'mailto',
    ]);
    expect(channels[2].textContent).toContain('citas@oxidobarberclub.mx');
    expect(root.querySelectorAll('.lz-branch').length).toBe(2);
    expect(root.querySelector('form')).toBeNull();
  });
});

describe('about brief and testimonials', () => {
  it('about/brief renders the summary and stats without an image', () => {
    const root = render('about', 'brief');
    expect(root.querySelector('.lz-about-brief__text')?.textContent).toMatch(
      /^En ÓXIDO cortamos/,
    );
    expect(root.querySelectorAll('.lz-about-brief__stat').length).toBe(3);
    expect(root.querySelector('img')).toBeNull();
  });

  it('testimonials links "Dejar reseña en Google" to googleReviewUrl, and drops it without copy', () => {
    const withCta = render('testimonials', 'cards');
    const review = [...withCta.querySelectorAll('a')].find(
      (a) => a.textContent === 'Dejar reseña en Google',
    );
    expect(review?.getAttribute('href')).toBe(pack.business.googleReviewUrl);
    const without = render('testimonials', 'cards', {
      writeReviewCta: '',
    });
    expect(without.querySelectorAll('.lz-reviews__actions a').length).toBe(1);
  });
});

describe('phase 3 variants', () => {
  it.each(['split', 'centered-arch', 'offset-card', 'image-bg'])(
    'hero/%s has the only <h1>, a sized image and the WhatsApp CTA',
    (variant) => {
      const root = render('hero', variant);
      expect(root.querySelectorAll('h1').length).toBe(1);
      const img = root.querySelector('img');
      expect(img?.getAttribute('width')).toMatch(/^\d+$/);
      expect(img?.getAttribute('height')).toMatch(/^\d+$/);
      expect(hrefs(root)[0]).toMatch(/^https:\/\/wa\.me\//);
    },
  );

  it.each(['price-list', 'cards', 'editorial-table'])(
    'services/%s lists every price',
    (variant) => {
      const root = render('services', variant);
      const prices = (pack.sections.services.prices as unknown[]).length;
      expect(root.textContent).toContain('$270');
      expect(
        root.querySelectorAll('h3, .lz-price-item__name').length,
      ).toBeGreaterThanOrEqual(prices);
    },
  );

  it('services/editorial-table drops the intro when the pack has none', () => {
    const root = render('services', 'editorial-table', { intro: '' });
    expect(root.querySelector('.lz-services-table__intro')).toBeNull();
  });

  it('team/list, about/statement, about/stats-strip and quote-feature render their keys', () => {
    expect(
      render('team', 'list').querySelectorAll('li.lz-team-list__item').length,
    ).toBe(4);
    expect(
      render('about', 'statement').querySelector('h2')?.textContent,
    ).toMatch(/semana después/);
    expect(
      render('about', 'stats-strip').querySelectorAll('.lz-about-stats__stat')
        .length,
    ).toBe(3);
    const quotes = render('testimonials', 'quote-feature');
    expect(quotes.querySelectorAll('blockquote').length).toBe(3);
    expect(hrefs(quotes)).toContain(pack.business.googleReviewUrl);
  });

  it.each(['big-wordmark', 'columns', 'minimal-centered'])(
    'footer/%s links every anchor and social',
    (variant) => {
      const links = hrefs(render('footer', variant));
      expect(links).toContain('#servicios');
      expect(links).toContain(pack.business.instagramUrl);
    },
  );

  it('footer/columns adds WhatsApp, tel and mailto', () => {
    const links = hrefs(render('footer', 'columns'));
    expect(links.some((l) => l.startsWith('tel:'))).toBe(true);
    expect(links.some((l) => l.startsWith('mailto:'))).toBe(true);
  });

  it.each(['inline', 'centered-logo'])(
    'navbar/%s keeps anchors and CTA',
    (variant) => {
      const links = hrefs(render('navbar', variant));
      expect(links).toContain('#servicios');
      expect(links.some((l) => l.startsWith('https://wa.me/'))).toBe(true);
    },
  );

  it('gallery/mosaic renders 8 sized lazy photos', () => {
    const imgs = [...render('gallery', 'mosaic').querySelectorAll('img')];
    expect(imgs.length).toBe(8);
    expect(imgs.every((i) => i.getAttribute('loading') === 'lazy')).toBe(true);
  });
});
