---
name: Local business · Terracota cálida
colors:
  background: '#F5BFAE'
  surface: '#F5BFAE'
  surface-container-low: '#F9DAD0'
  surface-container-high: '#E6B3A4'
  on-background: '#24191A'
  on-surface: '#24191A'
  on-surface-variant: '#5A4440'
  outline: '#82645D'
  outline-variant: '#CFA193'
  primary: '#24191A'
  on-primary: '#FFFFFF'
  tertiary: '#24191A'
typography:
  display-lg:
    fontFamily: Petrona
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 78px
  headline-md:
    fontFamily: Petrona
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
  body-lg:
    fontFamily: Rubik
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Rubik
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

Direction intent (es-MX): Táctil y terrosa: fondos teñidos cálidos, fotos con paspartú, tarjetas con sombra suave y serif robusta; para cocinas de barrio, florerías y tiendas de producto hecho a mano.

Art direction "Terracota cálida" for a Mexican local business. Surfaces are elevated, corners soft, spacing cozy, dividers none, photos framed. Buttons are solid, cards elevated, quotes marks.
Rigor: loose. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Starting palette: ground #F5BFAE, text #24191A, accent #24191A (as text: #24191A). You may propose closely related variants (shift tone or saturation) as long as the mood stays light and warm. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Petrona: an editorial serif) and one body face (like Rubik: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

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
- All copy in Mexican Spanish (es-MX), with the tone: Tú cercano, de mostrador; cuenta de dónde viene lo que vendes.
