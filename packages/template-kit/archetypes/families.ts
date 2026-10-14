/**
 * Composition families (docs/template-kit-design-principles.md §2): a page of 8 sections uses at
 * least 4 families and never stacks three image-beside-text sections in a row. Header, marquee,
 * floating WhatsApp and footer are chrome and don't count.
 */

export type Family =
  | 'media-text'
  | 'full-media'
  | 'type'
  | 'rows'
  | 'cells'
  | 'quote'
  | 'figures'
  | 'split-panel'
  | 'band'
  | 'chrome';

export const FAMILIES: Record<string, Family> = {
  'hero/split': 'media-text',
  'hero/panel': 'media-text',
  'hero/duo-arch': 'media-text',
  'hero/image-bg': 'full-media',
  'hero/framed': 'full-media',
  'hero/poster': 'full-media',
  'hero/columns': 'type',
  'hero/centered-arch': 'type',
  'hero/offset-card': 'type',
  'hero/rail': 'type',
  'hero/bento': 'cells',
  'hero/overlap': 'media-text',
  'hero/stack': 'split-panel',
  'about/text-image-offset': 'media-text',
  'about/portrait': 'media-text',
  'about/statement': 'type',
  'about/stats-strip': 'figures',
  'about/brief': 'figures',
  'services/price-list': 'rows',
  'services/menu-columns': 'rows',
  'services/editorial-table': 'rows',
  'services/cards': 'cells',
  'services/product-grid': 'cells',
  'gallery/grid': 'full-media',
  'gallery/mosaic': 'full-media',
  'gallery/bento': 'full-media',
  'gallery/strip': 'cells',
  'team/grid': 'cells',
  'team/list': 'rows',
  'team/spotlight': 'media-text',
  'testimonials/cards': 'cells',
  'testimonials/quote-feature': 'quote',
  'testimonials/rating-wall': 'quote',
  'faq/list': 'rows',
  'faq/two-col': 'split-panel',
  'faq/grid': 'cells',
  'locations/single': 'media-text',
  'locations/single-card': 'cells',
  'locations/with-contact': 'split-panel',
  'locations/map-link': 'split-panel',
  'locations/cards': 'cells',
  'cta/band': 'band',
  'navbar/inline': 'chrome',
  'navbar/centered-logo': 'chrome',
  'navbar/notice-bar': 'chrome',
  'marquee/ticker': 'chrome',
  'floating-whatsapp/bubble': 'chrome',
  'footer/big-wordmark': 'chrome',
  'footer/columns': 'chrome',
  'footer/minimal-centered': 'chrome',
  'footer/ledger': 'chrome',
};

export function familyOf(slot: string, variant: string): Family | undefined {
  return FAMILIES[`${slot}/${variant}`];
}
