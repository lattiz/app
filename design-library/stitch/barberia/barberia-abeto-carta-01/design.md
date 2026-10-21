---
name: Local business · Insignia y musgo
colors:
  background: '#314B3E'
  surface: '#314B3E'
  surface-container-low: '#3B5748'
  surface-container-high: '#456353'
  on-background: '#F1F2EE'
  on-surface: '#F1F2EE'
  on-surface-variant: '#C9CEC9'
  outline: '#93A39A'
  outline-variant: '#53695B'
  primary: '#C4CACF'
  on-primary: '#314B3E'
  tertiary: '#C4CACF'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 83px
    fontWeight: '700'
    lineHeight: 89px
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 41px
    fontWeight: '600'
    lineHeight: 48px
  body-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Geist
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

Direction intent (es-MX): Barbería elegante y moderna con esencia de oficio: verde bosque oscuro, plata en vez de dorado, serif de alto contraste y composición editorial; luxury sobrio, sin superlativos.

Art direction "Insignia y musgo" for a Mexican local business. Surfaces are outlined, corners sharp, spacing airy, dividers hairline, photos plain. Buttons are outline, cards outlined, quotes marks.
Rigor: loose. Explore: the tokens above are a guide, not a straitjacket.

## Colors

Starting palette: ground #314B3E (deep forest green), text #F1F2EE (ivory), accent #C4CACF (polished silver, fill and hairlines only, never gold). You may propose closely related variants (shift tone or saturation) as long as the mood stays dark and cool. Neutral accents are welcome. Keep body text at WCAG AA contrast (4.5:1) on every surface.

## Typography

One display face for headlines (like Bodoni Moda: an editorial serif) and one body face (like Geist: a clean grotesque or humanist sans). These are examples of the style, not a closed list: any similar Google Fonts pair works. Exactly two families, both from Google Fonts; never a third face and never icon fonts. Minimum body size 14px.

## Layout

12-column grid. One long page: header, hero, about, services as a price menu, ritual steps, gallery, testimonials, FAQ, contact, footer. Bento grids, overlapping elements and stacked cards are welcome when the direction calls for them. Generous whitespace.

## Hard constraints (Lattiz kit; these are strict so the harvester can map the design)

- No gradients as the background of primary text; text always at high contrast.
- Icons are inline SVG only: no icon webfonts (no Material Symbols, no Font Awesome).
- Semantic structure by section: header, hero (one h1), social proof, features or services, testimonials, FAQ, CTA, contact, footer.
- Single-column layout on mobile.
- No forms or input fields: contact is a WhatsApp button, a phone link and an email link.
- No carousels, sliders, video, iframes or canvas.
- No real brand copy and no images of specific, identifiable real people; every image is a replaceable placeholder.
- All copy in Mexican Spanish (es-MX), with the tone: Tú sereno y de oficio; frases firmes, sin prisa.
