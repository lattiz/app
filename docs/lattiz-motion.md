# Lattiz Motion (v2)

A small runtime (~7.9 KB gzip, budget 10 KB) that turns declarative `data-lz-*`
attributes into motion and interactive widgets **on published Pro sites only**.
It is our own code: ScrollReveal (GPLv3/commercial) and GSAP (licence forbids
no-code animation builders) were ruled out.

v2 adds **section choreography**: a template declares the *intent* of each section once
(`data-lz-section="cards"`) and the runtime animates its semantic children with shared
motion tokens, so no node needs its own attribute. Every v1 attribute keeps working and acts
as an override. Audit and measurements: `docs/lattiz-motion-audit.md`.

- Source: `apps/tenant-sites/lib/lz-motion/src/{runtime.js,style.css}`.
- Build: `pnpm --filter @lattiz/tenant-sites build:motion` minifies with esbuild
  into the committed `lib/lz-motion/runtime.generated.ts` and fails above 10 KB gzip.
- Injection: `app/route.ts` → `injectMotion()` as the last serve-time step, only when
  `get_public_tenant_site().is_pro` (serving + entitled + Pro plan) **and** the HTML
  contains a v1 motion attribute, or a `data-lz-section` other than `none` without
  `data-lz-motion="none"`. Template-kit's own `data-lz-slot|variant|key|…` never trigger it.
- The editor canvas never loads it, so the attributes are inert there; a Básico site
  with the same HTML renders static and fully visible (no runtime, no hidden states).
- Sections are tagged by the seed (`--motion`, see `docs/template-workflow.md`), not by hand.

## Rules

1. **Progressive enhancement.** The runtime adds `lz-js` to `<html>`. Hidden states exist
   only under `.lz-js`, on targets of a trigger the runtime armed; without JS nothing hides.
2. **LCP safety.** Only below-the-fold sections are armed (one `getBoundingClientRect` pass at
   init). The hero plays from first paint (the runtime runs before first paint: it is inline at
   the end of `<body>` behind the render-blocking CSS); its image only *settles* (scale) and is
   never transparent or clipped. If the `<h1>` is bigger than the hero image, its words move
   without fading. Any other section in the first viewport stays static.
3. **One `IntersectionObserver` per page**, observing triggers (sections). On trigger, targets
   already in view cascade from index 0; targets further down wait on **one** deferred anchor
   per section (same observer), so a fast scroll or an anchor jump never leaves visible content
   blank. No scroll listeners, no per-node observers.
4. **Failsafe.** If the observer hasn't reported within 2.5 s, every armed target plays.
   A module that throws is skipped (each runs in its own try/catch).
5. **Reduced motion / `none`.** With `prefers-reduced-motion: reduce` or
   `data-lz-motion="none"` nothing is armed or split, counters show their final value and
   scroll effects are off. Lightbox, compare, countdown and open-now keep working.
6. **Transform/opacity only** (individual `translate`/`scale`, which compose with a template's
   own `transform`), plus `clip-path` for media masks. `will-change` exists only while a target
   animates. Read pass first, write pass after: no layout thrash.

## Contract v2 (additive)

| Attribute | On | Effect |
|---|---|---|
| `data-lz-motion="calm\|editorial\|none"` | root wrapper (`.lz-page`) | Preset for the whole page. Default `calm`; `none` disables choreography (and the runtime isn't even injected unless v1 attributes are present). |
| `data-lz-progress` | root wrapper | Opt-in scroll progress bar (CSS `animation-timeline: scroll()` only; browsers without it get none). |
| `data-lz-section="hero\|text\|cards\|gallery\|stats\|cta\|footer\|none"` | each `<section>`/`<header>`/`<footer>` block | Default choreography by type (table below). Unknown values behave as `text`; `none` opts the section out. |
| `data-lz-reveal="none"` | any node inside a section | Opts that node and its subtree out. |
| any v1 attribute | node inside a section | Override played by the section's trigger (its own effect, delay, duration, stagger step or word split). |

### Defaults by section type

What counts as a child: headings, paragraphs, quotes, list items, `<summary>`, buttons
(`a[class*=button]`, `button`, `[role=button]`), media (`img`, `picture`, `video`, `iframe`) and
**groups** (≥ 3 look-alike siblings: cards, rows, `details`, figures). Group items cascade **by
row** (same top = same row), so a 3-column grid plays row by row and a list item by item.
Cascade steps are clamped to 8; words to 16.

| Type | Primary | Secondary |
|---|---|---|
| `hero` | Kicker → headline word by word → text → buttons cascade (from first paint) | Image settles from a slight scale; parallax (`translate`) if the image sits in a clipping frame |
| `text` | Kicker + heading + paragraphs rise, short stagger | Media reveal with a mask (`clip-path`) |
| `cards` | Heading block rises | Group items cascade by row |
| `gallery` | Heading rises | Items reveal with a mask; slow hover zoom on images inside a clipping frame |
| `stats` | Numbers count up (v1 counter; plain numeric text like `+1,200`, `4.9`, `98%` is detected; bare years are not) | Labels rise |
| `cta` | Heading + button rise | Soft accent glow drifting behind the content (CSS, `::before`) |
| `footer` | One fade, no stagger | — |

Navbar, floating buttons and marquees are not tagged. A sticky/fixed `<header>` gets
`.lz-header` and `html.lz-scrolled` toggles from a sentinel element (no scroll listener);
the default style is a soft shadow under the header (opacity only).

### Motion tokens

Defined with `:where()` (zero specificity), so a template can override any of them in its `:root`.

| Token | `calm` (default) | `editorial` |
|---|---|---|
| `--lz-dur` | 640ms | 880ms |
| `--lz-media-dur` | 900ms | 1200ms |
| `--lz-dist` | 16px | 32px |
| `--lz-ease` | `cubic-bezier(.22,.61,.36,1)` | `cubic-bezier(.16,1,.3,1)` |
| `--lz-stagger` | 70ms | 95ms |
| `--lz-word-step` | 40ms | 55ms |

### CSS-only helpers (Pro stylesheet)

`lz-hover-lift` (lift on hover) · `lz-hover-zoom` (frame that zooms its `img` on hover) ·
`lz-fill-hover` (button fill sweeps in on hover; `--lz-fill`, `--lz-fill-text`) ·
`lz-marquee` (the single child scrolls; duplicate its content once; `--lz-marquee-dur`) ·
`lz-stack` (children stack as sticky cards; `--lz-stack-top`). All off with reduced motion.

## v1 attributes (version-stable)

Outside a v2 section they behave as in v1, with two fixes: nested reveals share the outermost
reveal's trigger (they used to fire independently), and staggers are clamped to 16 steps.

| Attribute | On | Effect |
|---|---|---|
| `data-lz-reveal="fade-up\|fade\|zoom\|slide-left\|slide-right"` | any element | Animates in when it enters the viewport. Default `fade-up`. `none` opts out (v2). |
| `data-lz-delay="ms"` / `data-lz-duration="ms"` | reveal element | Extra delay (default 0) and duration (default: the preset's `--lz-dur`). |
| `data-lz-stagger="ms"` | parent | Its children reveal in sequence, `ms` apart (default 90). An optional `data-lz-reveal` on the parent names the children's effect; a child's own `data-lz-reveal` wins. |
| `data-lz-words` / `data-lz-words="ms"` | text element | Word-by-word reveal (default 45 ms apart; the preset's `--lz-word-step` inside a v2 section). Inline markup survives; its words are split too. |
| `data-lz-counter="1200"` (+ `data-lz-prefix`, `data-lz-suffix`, `data-lz-duration`) | element | Counts from 0 to the value (es-MX format, decimals kept from the value). Write the final value as the element's text for no-JS visitors. |
| `data-lz-parallax="0.2"` | element | Vertical parallax, factor clamped to −1…1. CSS `animation-timeline: view()` where supported; otherwise the v1 passive scroll listener. |
| `data-lz-lightbox` | `<img>` or a container of images | Click/Enter opens a dialog; ←/→ move through the container's images; ESC or the backdrop closes; focus is trapped and restored. `data-lz-full` on an image sets a larger source. |
| `data-lz-compare` / `data-lz-compare="30"` | container with two `<img>` (before, after) | Before/after slider (range input + `clip-path`), starting at the given percent (50). |
| `data-lz-countdown="2026-12-31T23:59:00-06:00"` | element | Live countdown. Children with `data-lz-unit="days\|hours\|minutes\|seconds"` are filled individually; otherwise the text becomes `3d 04:12:09`. At zero adds `.lz-expired` and shows `data-lz-expired-text` if set. |
| `data-lz-open-now` (+ `data-lz-open-text`, `data-lz-closed-text`) | element | "Abierto ahora" / "Cerrado" from the business hours in `#lz-ld` (JSON-LD, timezone in its `data-lz-tz`) or from `data-lz-open-hours='{"mon":[{"open":"09:00","close":"19:00"}]}'` (+ optional `data-lz-tz`). Sets `data-lz-state="open\|closed"`, toggles `.lz-open-now` / `.lz-closed-now`, refreshes every minute; overnight ranges supported. |

## Examples

```html
<div class="lz-page" data-lz-motion="editorial">
  <section data-lz-section="hero">…<h1>El oficio de cortar bien</h1>…</section>
  <section data-lz-section="cards">
    <h2>Servicios</h2>
    <ul><li>Corte</li><li>Barba</li><li>Color</li></ul>
  </section>
  <section data-lz-section="stats"><p>+1,200</p><p>clientes</p></section>
  <section data-lz-section="text">
    <h2 data-lz-words="70">Override: palabras más lentas</h2>
    <p data-lz-reveal="none">Este párrafo no se anima.</p>
  </section>
</div>

<!-- v1, still valid anywhere -->
<ul data-lz-stagger="120" data-lz-reveal="zoom"><li>Corte</li><li>Barba</li></ul>
<div data-lz-compare>
  <img src="antes.webp" alt="Antes" width="800" height="600">
  <img src="despues.webp" alt="Después" width="800" height="600">
</div>
<span data-lz-open-now class="badge">Horario</span>
```

## Not done on purpose

- **`content-visibility:auto`**: the audit showed no paint cost to recover (TBT 0, the only long
  tasks are image decodes that also happen without the runtime) and it risks anchors and CLS.
- **Header compaction by size**: shrinking a sticky header reflows the page (CLS); the runtime
  only exposes `html.lz-scrolled` and a shadow. Templates may restyle with transforms.

## Changing the contract

Attribute names and meanings above must keep working for sites already published (the runtime
is served to every Pro site at request time). Add new attributes instead of changing existing
ones, update this document, run `build:motion` and check the gzip budget it prints.
