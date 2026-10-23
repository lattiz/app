---
name: Local business · Neón nocturno
colors:
  background: '#15110E'
  surface: '#15110E'
  surface-container-low: '#211B17'
  surface-container-high: '#2F2823'
  on-background: '#F1ECE7'
  on-surface: '#F1ECE7'
  on-surface-variant: '#A89F97'
  outline: '#8F867E'
  outline-variant: '#3E3630'
  primary: '#D2C6BE'
  on-primary: '#15110E'
  tertiary: '#D2C6BE'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 83px
    fontWeight: '400'
    lineHeight: 89px
  headline-md:
    fontFamily: Anton
    fontSize: 41px
    fontWeight: '600'
    lineHeight: 48px
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Space Grotesk
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

Starting palette: ground #15110E, text #F1ECE7, accent #D2C6BE (as text: #D2C6BE). You may propose closely related variants (shift tone or saturation) as long as the mood stays dark and cool. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Anton: a clean grotesque or humanist sans) and one body face (like Space Grotesk: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

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
