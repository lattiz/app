---
name: Local business · Tinta y papel
colors:
  background: '#F4F1EA'
  surface: '#F4F1EA'
  surface-container-low: '#FAF9F6'
  surface-container-high: '#E5E2DB'
  on-background: '#1A1917'
  on-surface: '#1A1917'
  on-surface-variant: '#605E5B'
  outline: '#7C7A76'
  outline-variant: '#CDCAC4'
  primary: '#1A1917'
  on-primary: '#FFFFFF'
  tertiary: '#1A1917'
typography:
  display-lg:
    fontFamily: Schibsted Grotesk
    fontSize: 63px
    fontWeight: '700'
    lineHeight: 68px
  headline-md:
    fontFamily: Schibsted Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 37px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Source Serif 4
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.08em
rounded:
  sm: 0px
  DEFAULT: 0px
  lg: 0px
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  section-gap: 112px
  stack-md: 20px
---

## Brand & Style

Direction intent (es-MX): Monocromo suizo: tinta sobre papel, retícula estricta, filetes finos y una sola foto enmarcada; para despachos, tiendas de diseño y consultorios que quieren verse precisos.

Art direction "Tinta y papel" for a Mexican local business. Surfaces are flat, corners sharp, spacing cozy, dividers rule, photos framed. Buttons are outline, cards flat, quotes rule.
Rigor: loose. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Starting palette: ground #F4F1EA, text #1A1917, accent #1A1917 (as text: #1A1917). You may propose closely related variants (shift tone or saturation) as long as the mood stays light and neutral. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Schibsted Grotesk: a clean grotesque or humanist sans) and one body face (like Source Serif 4: an editorial serif). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

## Layout

12-column grid. One long page: header, hero, about, services with prices, testimonials, FAQ, contact, footer. Bento grids, overlapping elements and stacked cards are welcome when the direction calls for them. Balanced spacing.

## Hard constraints (Lattiz kit; these are strict so the harvester can map the design)

- No gradients as the background of primary text; text always at high contrast.
- Icons are inline SVG only: no icon webfonts (no Material Symbols, no Font Awesome).
- Semantic structure by section: header, hero (one h1), social proof, features or services, testimonials, FAQ, CTA, contact, footer.
- Single-column layout on mobile.
- No forms or input fields: contact is a WhatsApp button, a phone link and an email link.
- No carousels, sliders, video, iframes or canvas.
- No real brand copy and no images of specific, identifiable real people; every image is a replaceable placeholder.
- All copy in Mexican Spanish (es-MX), with the tone: Usted claro y preciso; vocabulario del oficio sin jerga.
