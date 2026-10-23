---
name: Local business · Cantera editorial
colors:
  background: '#E9E5DE'
  surface: '#E9E5DE'
  surface-container-low: '#F5F3F0'
  surface-container-high: '#DBD7D1'
  on-background: '#26231F'
  on-surface: '#26231F'
  on-surface-variant: '#5D5954'
  outline: '#7E7A75'
  outline-variant: '#C6C2BC'
  primary: '#4A4540'
  on-primary: '#FFFFFF'
  tertiary: '#4A4540'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 83px
    fontWeight: '700'
    lineHeight: 89px
  headline-md:
    fontFamily: Newsreader
    fontSize: 41px
    fontWeight: '600'
    lineHeight: 48px
  body-lg:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Public Sans
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
  gutter: 32px
  section-gap: 144px
  stack-md: 28px
---

## Brand & Style

Direction intent (es-MX): Revista impresa: serif grande alineada a la izquierda, mucho aire, una foto desplazada y filetes en vez de cajas; para despachos, restaurantes de autor y florerías con oficio.

Art direction "Cantera editorial" for a Mexican local business. Surfaces are flat, corners sharp, spacing airy, dividers hairline, photos offset. Buttons are underline, cards flat, quotes rule.
Rigor: loose. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Starting palette: ground #E9E5DE, text #26231F, accent #4A4540 (as text: #4A4540). You may propose closely related variants (shift tone or saturation) as long as the mood stays light and neutral. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Newsreader: an editorial serif) and one body face (like Public Sans: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

## Layout

12-column grid. One long page: header, hero, about, services with prices, testimonials, FAQ, contact, footer. Bento grids, overlapping elements and stacked cards are welcome when the direction calls for them. Generous whitespace.

## Hard constraints (Lattiz kit; these are strict so the harvester can map the design)

- No gradients as the background of primary text; text always at high contrast.
- Icons are inline SVG only: no icon webfonts (no Material Symbols, no Font Awesome).
- Semantic structure by section: header, hero (one h1), social proof, features or services, testimonials, FAQ, CTA, contact, footer.
- Single-column layout on mobile.
- No forms or input fields: contact is a WhatsApp button, a phone link and an email link.
- No carousels, sliders, video, iframes or canvas.
- No real brand copy and no images of specific, identifiable real people; every image is a replaceable placeholder.
- All copy in Mexican Spanish (es-MX), with the tone: Usted o tú sereno, de oficio; frases completas y concretas.
