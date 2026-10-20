---
name: Local business · Jardín suave
colors:
  background: '#FFEAF3'
  surface: '#FFEAF3'
  surface-container-low: '#FFF4F9'
  surface-container-high: '#FBD6E8'
  on-background: '#14213D'
  on-surface: '#14213D'
  on-surface-variant: '#3F4A66'
  outline: '#6B7391'
  outline-variant: '#E9B8CD'
  primary: '#14213D'
  on-primary: '#FFFFFF'
  tertiary: '#35C4E6'
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
Rigor: loose, but the brand palette and fonts are fixed. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Brand palette (fixed, do not shift): ground #FFEAF3 (pastel pink), text #14213D (navy), accent #35C4E6 (turquoise, used as fill only; text on it is #14213D). Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Fredoka: a clean grotesque or humanist sans) and one body face (like Nunito: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

## Layout

12-column grid. One long page: header, hero, about, catalog, gallery, testimonials, FAQ, contact, footer. Bento grids, overlapping elements and stacked cards are welcome when the direction calls for them. Generous whitespace.

## Hard constraints (Lattiz kit; these are strict so the harvester can map the design)

- No gradients as the background of primary text; text always at high contrast.
- Icons are inline SVG only: no icon webfonts (no Material Symbols, no Font Awesome).
- Semantic structure by section: header, hero (one h1), social proof, features or services, testimonials, FAQ, CTA, contact, footer.
- Single-column layout on mobile.
- No forms or input fields: contact is a WhatsApp button, a phone link and an email link.
- No carousels, sliders, video, iframes or canvas.
- No real brand copy and no images of specific, identifiable real people; every image is a replaceable placeholder.
- All copy in Mexican Spanish (es-MX), with a sweet, playful, friendly tone (candy shop).
