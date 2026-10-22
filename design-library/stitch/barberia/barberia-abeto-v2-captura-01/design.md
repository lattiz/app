---
name: Barbería · Insignia y musgo
colors:
  background: '#2C3E24'
  surface: '#2C3E24'
  surface-container-low: '#37482F'
  surface-container-high: '#42523B'
  on-background: '#E1E3E1'
  on-surface: '#E1E3E1'
  on-surface-variant: '#C0C5BF'
  outline: '#90998C'
  outline-variant: '#4D5C46'
  primary: '#C3C7CD'
  on-primary: '#2C3E24'
  tertiary: '#C3C7CD'
typography:
  display-lg:
    fontFamily: Libre Caslon Display
    fontSize: 83px
    fontWeight: '700'
    lineHeight: 89px
  headline-md:
    fontFamily: Libre Caslon Display
    fontSize: 41px
    fontWeight: '600'
    lineHeight: 48px
  body-lg:
    fontFamily: Schibsted Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Schibsted Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Schibsted Grotesk
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

Direction intent (es-MX): Barbería de oficio: fondo verde musgo oscuro, plata en vez de dorado, serif en mayúsculas con espaciado amplio y una portada fotográfica con insignia; para barberías, cantinas y talleres con historia.

Art direction "Insignia y musgo" for a Mexican barbería. Surfaces are outlined, corners sharp, spacing airy, dividers hairline, photos plain. Buttons are outline, cards outlined, quotes marks.
Rigor: tight. Stay strictly inside the palette and typography below.

## Colors

Use exactly these colors: ground #2C3E24, text #E1E3E1, accent #C3C7CD (as text: #C3C7CD). Do not introduce other hues. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

Use exactly Libre Caslon Display for headlines and Schibsted Grotesk for everything else. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

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
- All copy in Mexican Spanish (es-MX), with the tone: Tú sereno y de oficio; frases firmes, sin prisa.
