---
name: Mármol Sobrio
colors:
  surface: '#f5faff'
  surface-dim: '#cddce8'
  surface-bright: '#f5faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf5ff'
  surface-container: '#e1f0fc'
  surface-container-high: '#dbeaf6'
  surface-container-highest: '#d6e5f0'
  on-surface: '#0f1d26'
  on-surface-variant: '#434750'
  inverse-surface: '#24323b'
  inverse-on-surface: '#e4f3ff'
  outline: '#747781'
  outline-variant: '#c4c6d1'
  surface-tint: '#3f5d9a'
  primary: '#002860'
  on-primary: '#ffffff'
  primary-container: '#1d3f7a'
  on-primary-container: '#8eacee'
  inverse-primary: '#aec6ff'
  secondary: '#4e6072'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f6'
  on-secondary-container: '#526576'
  tertiary: '#232c31'
  on-tertiary: '#ffffff'
  tertiary-container: '#394247'
  on-tertiary-container: '#a5aeb5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#244580'
  secondary-fixed: '#d2e5f9'
  secondary-fixed-dim: '#b6c9dd'
  on-secondary-fixed: '#0a1d2c'
  on-secondary-fixed-variant: '#374959'
  tertiary-fixed: '#dbe4eb'
  tertiary-fixed-dim: '#bfc8ce'
  on-tertiary-fixed: '#141d22'
  on-tertiary-fixed-variant: '#3f484e'
  background: '#f5faff'
  on-background: '#0f1d26'
  surface-variant: '#d6e5f0'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 34px
    fontWeight: '500'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2.5rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies high-touch clinical precision paired with quiet architectural luxury. Designed for an upscale private odontological studio in Polanco, Mexico City, the aesthetic moves away from sterilizing clinical anxiety toward serene, grounded composure. It bridges medical rigor with editorial restraint.

The visual narrative relies on spaciousness, deliberate typography, and whisper-soft structural boundaries. The interface communicates surgical mastery, stillness, and discretion. Tactile qualities are conveyed not through skeuomorphic gloss, but through crisp hairline divisions, crystalline ice-blue tones, and typographic hierarchy reminiscent of an architectural monograph.

## Colors

The palette creates a serene, luminous atmosphere rooted in cool mineral tones:

- **Canvas Ground (`#D6E5F1`):** A soft, atmospheric ice-blue canvas that eliminates sterile white glare while providing immediate calm.
- **Surface / Container (`#E7F0F7`):** A lighter, crystalline tint that lifts interactive zones, cards, and dialogue planes smoothly above the base floor.
- **Primary Accent (`#1D3F7A`):** Deep maritime blue, reserved for principal actions, critical confirmations, and authoritative focal anchors. Always pairs with crisp white (`#FFFFFF`) for typography.
- **Secondary / Supporting Slate (`#47596A`):** A quieted mineral slate providing accessible secondary information, captions, subtle icons, and subdued navigational states.
- **Deep Text Base (`#102236`):** Deep oceanic charcoal-ink ensuring clinical contrast without the harshness of pure black.
- **Hairline Border Tone (`rgba(16, 34, 54, 0.08)`):** A translucent ink veil used for precision divisions and container borders.

## Typography

The type system balances the intellectual heritage of a high-contrast transitional serif (**Playfair Display**) with the functional clarity of an engineered grotesque sans (**Plus Jakarta Sans**).

Headlines use controlled, deliberate tracking with tighter negative kerning at larger scales to maintain structural tension. Body text prioritizes comfortable reading rhythms with open vertical metrics and generous line heights, reducing cognitive load for treatment plans, doctor notes, and clinical histories. Labels and meta-tags utilize subtle positive letter-spacing for heightened legibility in compressed spaces.

## Layout & Spacing

A 12-column responsive grid structures layouts on desktop screens, collapsing to an 8-column system on tablets and a 4-column framework on mobile devices.

The design philosophy favors deliberate, quiet breathing room over dense packing. Margins are generous to frame content cleanly like art catalogue plates. Elements within cards and functional panels maintain a strict 8px harmonic spacing cadence. Vertical rhythm between major sections extends up to `space-xl` and beyond, giving each clinical specialty and patient milestone clear physical hierarchy.

## Elevation & Depth

To uphold the "mármol sobrio" aesthetic, heavy drop shadows and dramatic three-dimensional casts are avoided. Depth is established through subtle tonal stratification and precise hairline delineations:

- **Surface Layering:** The primary canvas ground (`#D6E5F1`) recedes quietly. Elevated containers and cards sit on a lighter, luminous plane (`#E7F0F7`).
- **Hairline Boundaries:** Rather than deep shadow edges, containers use a 1px solid hairline (`rgba(16, 34, 54, 0.08)` or `rgba(255, 255, 255, 0.6)` on dark surfaces) that outlines components with surgical precision.
- **Ambient Micro-Lift:** For floating contextual panels, dropdowns, or modals, use an imperceptible, diffuse ambient veil: `box-shadow: 0 8px 32px -4px rgba(16, 34, 54, 0.06)`. No sharp directional lighting or dark drop shadows.

## Shapes

The geometric framework is calm and architectural:

- **Cards & Primary Modules:** Standardized at `12px` (`0.75rem`), balancing softness with clinical exactitude.
- **Badges, Status Tags & Small Pills:** Standardized at `6px` (`0.375rem`), producing sharp, tailored tags without appearing juvenile.
- **Buttons & Form Fields:** Aligned to `8px` (`0.5rem`) for confident, tactile interaction points.
- **Full Circles:** Exclusively reserved for doctor headshot avatars, progress dials, and icon-only utility triggers.

## Components

### Buttons
- **Primary:** Deep maritime blue (`#1D3F7A`) fill, pure white text, 8px corner radius, padding `12px 24px`. Subtle hover state shifts to `#163261` with a seamless 200ms transition. No drop shadow.
- **Secondary / Ghost:** Transparent background enclosed by a 1px solid hairline border in `#47596A` at 30% opacity, deep text (`#102236`), with a soft hover fill of `rgba(231, 240, 247, 0.6)`.

### Cards & Panels
- **Structure:** Background in `#E7F0F7`, 12px border-radius, bounded by a 1px solid `rgba(16, 34, 54, 0.08)` border. Internal padding matches `space-lg` (24px) or `space-xl` (40px) for hero modules.
- **Header Accents:** Playfair Display section titles paired with subtle metadata chips.

### Chips & Badges
- **Visuals:** Height fixed at 24px or 28px, 6px border-radius, padding `4px 10px`. Background is a 40% translucent blend of the canvas base, text in `#47596A` or `#1D3F7A`, set in `label-sm` with slight positive tracking.

### Form Inputs
- **Treatment:** Crisp container background (`#E7F0F7`), 8px radius, enclosed by a 1px hairline border (`rgba(16, 34, 54, 0.15)`). Text in `#102236`. Focused states transition the border smoothly to `#1D3F7A` with a subtle, non-blurry 1px outer ring in `rgba(29, 63, 122, 0.15)`.

### Selection Controls (Checkboxes & Radios)
- **Geometry:** Checkboxes use a 4px soft radius; radio buttons are circular. Inactive state features an uncolored center with a 1.5px border in `#47596A`. Selected state fills with `#1D3F7A` and a clean white geometric check or inset dot.

### Specialized Clinical Modules
- **Treatment Timeline:** A minimal vertical hairline connecting milestone nodes with 6px status indicators, giving patients an orderly, stress-free view of procedural phases.
- **Odontogram & Diagnostics Panel:** High-contrast, clean-line dental arch vector diagrams presented on `#E7F0F7` cards, featuring slate selection outlines and maritime blue active condition markers.