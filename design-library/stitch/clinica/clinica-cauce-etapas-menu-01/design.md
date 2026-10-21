---
name: Local business · Mármol sobrio
colors:
  background: '#D6E5F1'
  surface: '#D6E5F1'
  surface-container-low: '#E7F0F7'
  surface-container-high: '#C8D7E4'
  on-background: '#102236'
  on-surface: '#102236'
  on-surface-variant: '#47596A'
  outline: '#697A8A'
  outline-variant: '#B2C2CF'
  primary: '#1D3F7A'
  on-primary: '#FFFFFF'
  tertiary: '#1D3F7A'
typography:
  display-lg:
    fontFamily: Gilda Display
    fontSize: 63px
    fontWeight: '700'
    lineHeight: 68px
  headline-md:
    fontFamily: Gilda Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 37px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.08em
rounded:
  sm: 6px
  DEFAULT: 12px
  lg: 10px
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  section-gap: 112px
  stack-md: 20px
---

## Brand & Style

Direction intent (es-MX): Confianza premium: colores fríos, serif fina, contornos en vez de rellenos y mucho orden; para clínicas, dentistas, despachos y veterinarias de especialidad.

Art direction "Mármol sobrio" for a Mexican local business. Surfaces are outlined, corners soft, spacing cozy, dividers hairline, photos plain. Buttons are solid, cards outlined, quotes rule.
Rigor: loose. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Starting palette: ground #D6E5F1, text #102236, accent #1D3F7A (as text: #1D3F7A). You may propose closely related variants (shift tone or saturation) as long as the mood stays light and cool. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Gilda Display: an editorial serif) and one body face (like Hanken Grotesk: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

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
- All copy in Mexican Spanish (es-MX), with the tone: Usted cordial y profesional; explica el proceso paso a paso.
