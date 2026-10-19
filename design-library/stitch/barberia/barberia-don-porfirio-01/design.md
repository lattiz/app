---
name: Artisanal Barberia Heritage
colors:
  surface: '#111413'
  surface-dim: '#111413'
  surface-bright: '#373a39'
  surface-container-lowest: '#0c0f0e'
  surface-container-low: '#191c1b'
  surface-container: '#1d201f'
  surface-container-high: '#282b29'
  surface-container-highest: '#323534'
  on-surface: '#e1e3e1'
  on-surface-variant: '#c2c8c2'
  inverse-surface: '#e1e3e1'
  inverse-on-surface: '#2e3130'
  outline: '#8c928d'
  outline-variant: '#424844'
  surface-tint: '#b0cdbc'
  primary: '#b0cdbc'
  on-primary: '#1c3529'
  primary-container: '#314b3e'
  on-primary-container: '#9dbaa9'
  inverse-primary: '#496456'
  secondary: '#c3c7cd'
  on-secondary: '#2c3136'
  secondary-container: '#454a4f'
  on-secondary-container: '#b4b9bf'
  tertiary: '#ffb4ab'
  on-tertiary: '#690005'
  tertiary-container: '#91000a'
  on-tertiary-container: '#ff978c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ccead8'
  primary-fixed-dim: '#b0cdbc'
  on-primary-fixed: '#062015'
  on-primary-fixed-variant: '#324c3f'
  secondary-fixed: '#dfe3e9'
  secondary-fixed-dim: '#c3c7cd'
  on-secondary-fixed: '#171c20'
  on-secondary-fixed-variant: '#43474c'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#111413'
  on-background: '#e1e3e1'
  surface-variant: '#323534'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: 0.15em
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: 0.12em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: 0.15em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: 0.12em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.12em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.10em
  title-md:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0.08em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.12em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.14em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The brand aesthetic merges old-world Mexican bespoke grooming heritage with cold industrial steel precision. Rooted in the ritual of hot towels, straight razors, and deep leather chairs, the interface evokes quiet masculine dignity, obsessive craft, and neighborhood permanence. 

The design language balances tactile vintage luxury and contemporary functionalism:
- **Surface & Materiality:** Deep forest greens and rich obsidian charcoals juxtaposed with brushed and beveled surgical steel borders. Cream surfaces evoke heavy cotton parchment and shaving foam.
- **Atmospheric Restraint:** Strictly no gold or brass embellishments. Precision is signaled through cold silver edge-highlights and finely calibrated monochrome hierarchies, punctuated sparingly by heritage barber pole crimson and cobalt blue.
- **Tone:** Authoritative, calm, impeccably groomed, and rooted in traditional craft.

## Colors

The color palette commands solemnity and precision. It refuses warm metallic cliches (strictly zero gold or yellow tones) in favor of deep vegetal mineral tones, raw steel, and charcoal stonework.

### Palette Implementation
- **Deep Forest Green (`#314B3E`):** Primary brand anchor. Applied to key signature hero cards, active toggle states, primary action surfaces, and primary structural accents.
- **Polished Steel / Silver (`#D1D5DB`, `#E5E7EB`):** High-precision secondary accent. Represents honed straight-razor edges, mirrored glass, and surgical instruments. Used for fine borders, divider insets, metallic linear gradients (`linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 50%, #4B5563 100%)`), and elevated icon strokes.
- **Obsidian / Charcoal Neutrals (`#121615` background base, `#1A1D1C` container surface, `#252A28` elevated surface):** Establish depth without becoming sterile black. Imparts the feeling of waxed volcanic stone and heavy dark leather.
- **Heritage Parchment Cream (`#F4F4F0`):** Inverted high-contrast zones. Dedicated to booking summaries, invoice slips, service menus, and readability-first editorial modules. Text on cream must be rendered in `#121615`.
- **Barber Heritage Accents:** Crimson Red (`#B91C1C`) and Cobalt Blue (`#1D4ED8`) are restricted to delicate status markers, calendar badges, historical hairline rules, and micro-accents. Never used as heavy solid backgrounds.

## Typography

Typographic scale is structured around high-contrast tension between editorial heritage and functional utility:
- **Headlines & Titles (Playfair Display):** Rendered predominantly in uppercase with tracked letterspacing (`0.10em` to `0.15em`). This mirrors chiseled barbershop glass leafing and mid-century Mexican typography.
- **Body & Numerical Values (Plus Jakarta Sans):** Geometric clarity and open apertures balance the dense display serif. It provides immediate legibility for booking slots, pricing, and service descriptions.
- **Labels, Badges & Overlines:** Set in small, bold sans-serif with wide uppercase tracking (`0.12em` to `0.14em`) to act as architectural signposts across the UI.

## Layout & Spacing

The layout is built upon an architectural 12-column desktop grid (6-column on tablet, 4-column on mobile) characterized by generous outer margins and disciplined internal density. 

### Rhythm & Alignment
- **Canvas Margins:** Generous 48px (`3rem`) margins on desktop enforce an unhurried, luxury salon experience. Mobile sections condense to 20px (`1.25rem`) to maximize screen width.
- **Component Padding:** Internal card padding is strictly uniform at 24px (`space-lg`) on desktop and 16px (`space-md`) on mobile.
- **Section Breaks:** Distinct editorial blocks (e.g., service catalog into master barber roster) are separated by hairline steel dividers bounded by 40px (`space-xl`) vertical buffer zones.

## Elevation & Depth

Visual hierarchy is communicated via cold-rolled steel borders, chamfered bevels, and atmospheric tonal layering rather than fuzzy drop shadows:

- **Surface Tiers:**
  - Base: Deepest Charcoal (`#121615`).
  - Mid-tier Cards: Charcoal Inset (`#1A1D1C`).
  - Elevated Menus & Interactive Cards: Forest Pitch (`#222B26`) or Bright Cream (`#F4F4F0`).
- **Steel Edge Highlights:** Floating surfaces feature a 1px razor-thin outline using a metallic gradient (`linear-gradient(135deg, rgba(229, 231, 235, 0.35) 0%, rgba(156, 163, 175, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)`). This mimics the ground edge of a fresh blade catching ambient light.
- **Shadow Quality:** When depth separation is required over background photography or dark surfaces, use an offset ambient shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.65)`. Shadows are uncolored and cold.

## Shapes

The shape system embraces a crisp, masculine geometry with minimal corner softening (`roundedness: 1`):
- **Base Geometry:** Standard containers, input fields, cards, and buttons use a rigid `0.25rem` (4px) corner radius. This evokes hand-cut leather patches, straight razor handles, and heavy ceramic tilework.
- **Outer Modals & Feature Cards:** May scale to `0.5rem` (8px) maximum.
- **Circular Elements:** Fully round profiles are reserved exclusively for circular barber portrait avatars, barber pole indicator icons, and radio selectors. Soft pill buttons are strictly forbidden.

## Components

### Buttons & Action Controls
- **Primary Action (The Blade):** Background `#314B3E`, foreground `#FFFFFF`, border 1px solid `#E5E7EB` with a subtle 135-degree steel bevel highlight. Uppercase serif or tracked sans-serif text. On hover, background shifts to `#3D5C4D` with crisp silver border brightening.
- **Secondary Action (Brushed Metal):** Background `#1A1D1C`, foreground `#E5E7EB`, border 1px solid `#4B5563`. On hover, border turns into silver gradient and text brightens to `#FFFFFF`.
- **Destructive Action:** Deep charcoal surface with `#B91C1C` border and crimson text.

### Cards & Surfaces
- **Dark Reserve Card:** Background `#1A1D1C`, border 1px solid `rgba(209, 213, 219, 0.15)`. Used for service items, barber profile blocks, and grooming product listings.
- **Parchment Slip Card:** High-contrast background `#F4F4F0`, foreground text `#121615`, border 1px solid `#D1D5DB`. Used for appointment checkout summaries, receipt confirmations, and booking confirmations.

### Form Inputs & Selectors
- **Input Fields:** Background `#121615`, border 1px solid `#374151`, text `#F4F4F0`. Placeholder in muted silver-grey `#6B7280`. Focus state: border shifts to solid polished steel `#D1D5DB` with an internal 1px forest green tint.
- **Checkboxes & Radios:** Sharp 2px-corner boxes or precise circles. Unchecked: `#1A1D1C` with steel border. Checked: `#314B3E` fill with an inset silver tick or pip.

### Chips & Badges
- **Status Indicators:** Inset pill or sharp tag featuring a 6px circular indicator dot (crimson `#B91C1C` for booked, cobalt `#1D4ED8` for confirmed/heritage badge, steel `#9CA3AF` for standard). Background `#121615` with fine hairline border.
- **Time Slots:** Grid of sharp 4px-radius tiles. Available slots display `#1A1D1C` with silver-muted typography; selected slots turn solid `#314B3E` with crisp `#FFFFFF` typography.

### Specialized Barber Heritage Elements
- **Service Menu Dividers:** Centered razor blade or classic shear glyph flanked by dual 1px steel hairline rules (`linear-gradient(90deg, transparent, #4B5563, transparent)`).
- **Barber Pole Accent Bar:** Ultra-thin (2px to 3px) top header border incorporating a subtle repeating 45-degree ribbon striping of crimson (`#B91C1C`), cream (`#F4F4F0`), and cobalt (`#1D4ED8`).