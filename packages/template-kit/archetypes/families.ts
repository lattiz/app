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
  'hero/photo-ribbon': 'full-media',
  'hero/columns': 'type',
  'hero/centered-arch': 'type',
  'hero/offset-card': 'type',
  'hero/arch-sticker': 'media-text',
  'hero/index-panel': 'full-media',
  'hero/ticket-board': 'split-panel',
  'hero/rail': 'type',
  'hero/bento': 'cells',
  'hero/overlap': 'media-text',
  'hero/stack': 'split-panel',
  'about/text-image-offset': 'media-text',
  'about/portrait': 'media-text',
  'about/statement': 'type',
  'about/stats-strip': 'figures',
  'about/brief': 'figures',
  'about/framed-craft': 'media-text',
  'about/order-steps': 'cells',
  'services/price-list': 'rows',
  'services/menu-columns': 'rows',
  'services/editorial-table': 'rows',
  'services/cards': 'cells',
  'services/ritual-cards': 'cells',
  'services/alternating-bands': 'media-text',
  'services/index-table': 'rows',
  'services/menu-leaders': 'rows',
  'services/product-grid': 'cells',
  'gallery/grid': 'full-media',
  'gallery/mosaic': 'full-media',
  'gallery/bento': 'full-media',
  'gallery/strip': 'cells',
  'gallery/collage': 'full-media',
  'team/grid': 'cells',
  'team/list': 'rows',
  'team/spotlight': 'media-text',
  'team/index-portraits': 'cells',
  'testimonials/cards': 'cells',
  'testimonials/paper-trio': 'cells',
  'testimonials/feature-stack': 'cells',
  'testimonials/hairline-trio': 'quote',
  'testimonials/quote-feature': 'quote',
  'testimonials/rating-wall': 'quote',
  'faq/list': 'rows',
  'faq/two-col': 'split-panel',
  'faq/grid': 'cells',
  'faq/numbered-cards': 'cells',
  'faq/column-panels': 'rows',
  'faq/index-answers': 'split-panel',
  'locations/single': 'media-text',
  'locations/single-card': 'cells',
  'locations/with-contact': 'split-panel',
  'locations/booking-panel': 'split-panel',
  'locations/arch-visit': 'split-panel',
  'locations/split-panel': 'split-panel',
  'locations/pickup-board': 'split-panel',
  'locations/corner-postcard': 'media-text',
  'locations/map-link': 'split-panel',
  'locations/cards': 'cells',
  'cta/band': 'band',
  'cta/aside-note': 'split-panel',
  'cta/closing-band': 'band',
  'navbar/inline': 'chrome',
  'navbar/centered-logo': 'chrome',
  'navbar/notice-bar': 'chrome',
  'marquee/ticker': 'chrome',
  'floating-whatsapp/bubble': 'chrome',
  'footer/big-wordmark': 'chrome',
  'footer/columns': 'chrome',
  'footer/minimal-centered': 'chrome',
  'footer/ledger': 'chrome',
  'footer/signature-bar': 'chrome',
  'footer/hours-blocks': 'chrome',
  'navbar/index-strip': 'chrome',
  'hero/vertical-slip': 'split-panel',
  'hero/split-mosaic': 'cells',
  'about/coal-log': 'cells',
  'services/chalk-board': 'cells',
  'faq/rule-table': 'rows',
  'gallery/contact-sheet': 'cells',
  'testimonials/order-slips': 'cells',
  'locations/table-map': 'split-panel',
  'footer/receipt': 'chrome',
};

export function familyOf(slot: string, variant: string): Family | undefined {
  return FAMILIES[`${slot}/${variant}`];
}
