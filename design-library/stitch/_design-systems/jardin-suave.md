---
name: Local business · Jardín suave
colors:
  background: '#A6DDD6'
  surface: '#A6DDD6'
  surface-container-low: '#CBEBE7'
  surface-container-high: '#9CD0C9'
  on-background: '#14211D'
  on-surface: '#14211D'
  on-surface-variant: '#3A524D'
  outline: '#567670'
  outline-variant: '#8CBBB5'
  primary: '#14211D'
  on-primary: '#FFFFFF'
  tertiary: '#14211D'
typography:
  display-lg:
    fontFamily: Fredoka
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 78px
  headline-md:
    fontFamily: Fredoka
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
  body-lg:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.08em
rounded:
  sm: 20px
  DEFAULT: 32px
  lg: 32px
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 32px
  section-gap: 144px
  stack-md: 28px
---

## Brand & Style

Direction intent (es-MX): Amable y redondo: fondos teñidos, arcos, botones en cápsula y sans de formas abiertas; para estéticas, veterinarias, consultorios pediátricos y florerías.

Art direction "Jardín suave" for a Mexican local business. Surfaces are tinted, corners pill, spacing airy, dividers none, photos arch. Buttons are pill, cards tinted, quotes marks.
Rigor: loose. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Starting palette: ground #A6DDD6, text #14211D, accent #14211D (as text: #14211D). You may propose closely related variants (shift tone or saturation) as long as the mood stays light and cool. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Fredoka: a clean grotesque or humanist sans) and one body face (like Nunito: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

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
- All copy in Mexican Spanish (es-MX), with the tone: Tú cálido y tranquilo; explica sin tecnicismos.
