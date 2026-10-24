---
name: Local business · Neón nocturno
colors:
  background: '#111311'
  surface: '#111311'
  surface-container-low: '#1E201E'
  surface-container-high: '#2C2E2B'
  on-background: '#EEF2E8'
  on-surface: '#EEF2E8'
  on-surface-variant: '#969992'
  outline: '#8B8E87'
  outline-variant: '#393B38'
  primary: '#C6F432'
  on-primary: '#111311'
  tertiary: '#C6F432'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 83px
    fontWeight: '700'
    lineHeight: 89px
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 41px
    fontWeight: '600'
    lineHeight: 48px
  body-lg:
    fontFamily: Barlow
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Barlow
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Barlow
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
  gutter: 16px
  section-gap: 80px
  stack-md: 14px
---

## Brand & Style

Direction intent (es-MX): Cartel nocturno: fondo oscuro, condensada en mayúsculas, un acento eléctrico y fotos a duotono; para barberías, gimnasios y taquerías con actitud.

Art direction "Neón nocturno" for a Mexican local business. Surfaces are outlined, corners sharp, spacing compact, dividers rule, photos duotone-overlay. Buttons are solid, cards outlined, quotes marks.
Rigor: loose. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Starting palette: ground #111311, text #EEF2E8, accent #C6F432 (as text: #C6F432). You may propose closely related variants (shift tone or saturation) as long as the mood stays dark and cool. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Bebas Neue: a clean grotesque or humanist sans) and one body face (like Barlow: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

## Layout

12-column grid. One long page: header, hero, about, services with prices, testimonials, FAQ, contact, footer. Bento grids, overlapping elements and stacked cards are welcome when the direction calls for them. Dense and efficient.

## Hard constraints (Lattiz kit; these are strict so the harvester can map the design)

- No gradients as the background of primary text; text always at high contrast.
- Icons are inline SVG only: no icon webfonts (no Material Symbols, no Font Awesome).
- Semantic structure by section: header, hero (one h1), social proof, features or services, testimonials, FAQ, CTA, contact, footer.
- Single-column layout on mobile.
- No forms or input fields: contact is a WhatsApp button, a phone link and an email link.
- No carousels, sliders, video, iframes or canvas.
- No real brand copy and no images of specific, identifiable real people; every image is a replaceable placeholder.
- All copy in Mexican Spanish (es-MX), with the tone: Tú directo, de barrio; frases cortas con ritmo.
