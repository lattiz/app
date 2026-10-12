# Lattiz Motion (v3)

A small runtime (~9.4 KB gzip, budget 12 KB) that turns declarative `data-lz-*` attributes into
motion and interactive widgets **on published Pro sites only**. It is our own code: ScrollReveal
(GPLv3/commercial) and GSAP (licence forbids no-code animation builders) were ruled out.

A template declares the *intent* of each section once (`data-lz-section="faq"`); the runtime splits
it into **reveal groups**, measures where each item sits and picks a pattern and a variant per item,
all with shared motion tokens. v1 attributes keep working and act as overrides. Audit and
measurements: `docs/lattiz-motion-audit.md`.

- Source: `apps/tenant-sites/lib/lz-motion/src/{runtime.js,style.css}`.
- Build: `pnpm --filter @lattiz/tenant-sites build:motion` minifies with esbuild into the committed
  `lib/lz-motion/runtime.generated.ts` and fails above 12 KB gzip.
- Injection: `app/route.ts` → `injectMotion()` as the last serve-time step, only when
  `get_public_tenant_site().is_pro` (serving + entitled + Pro plan) **and** the HTML contains a v1
  motion attribute, or a `data-lz-section` other than `none` without `data-lz-motion="none"`.
  Template-kit's own `data-lz-slot|variant|key|…` never trigger it.
- The editor canvas never loads it, so the attributes are inert there; a Básico site with the same
  HTML renders static and fully visible (no runtime, no hidden states).
- Sections are tagged by the seed (`--motion`, see `docs/template-workflow.md`), not by hand.

## Rules

1. **Progressive enhancement.** The runtime adds `lz-js` to `<html>`. Hidden states exist only on
   targets the runtime armed (`.lz-t` without `.lz-go`); without JS nothing hides.
2. **LCP safety.** Only groups below the fold are armed (one `getBoundingClientRect` pass at init).
   The hero plays from first paint (the runtime runs before first paint); its image only settles
   (`scale`) or slides in (`translate`), never transparent or clipped. If the `<h1>` is bigger than
   the hero image, its words move without being masked. Other groups in the first viewport stay static.
3. **One `IntersectionObserver` per page** (threshold 0.15, `rootMargin: 0 0 -8% 0`) observing the
   first element of every reveal group; `unobserve` after it plays. Groups that become visible in the
   same callback cascade in page order. Each callback also sweeps groups that were jumped over (anchor
   links, fast flicks), and a sentinel at the end of the page plays whatever is left. No scroll
   listeners, no per-node observers.
4. **Failsafe.** If the observer hasn't reported within 2.5 s, every armed group plays. A module that
   throws is skipped (each runs in its own try/catch).
5. **Reduced motion / `none`.** With `prefers-reduced-motion: reduce` or `data-lz-motion="none"`
   nothing is armed or split, counters show their final value and scroll effects are off. Lightbox,
   compare, countdown and open-now keep working.
6. **Transform/opacity only** (individual `translate`/`scale`, which compose with a template's own
   `transform`), plus `clip-path` for masks. `will-change` exists only while a target animates. Read
   pass first, write pass after. The root wrapper gets `overflow-x: clip`, so sideways travel never
   creates a horizontal scrollbar (unlike `hidden`, `clip` keeps `position: sticky` working).

## Reveal groups

A group is a logical block inside a section, typically 3–12 per section:

- the **heading block** (kicker, heading, intro, buttons that sit together);
- **each row** of look-alike siblings (≥ 3 cards, list items, `details`, figures; runs of plain `<p>`
  are prose, not a group);
- **each column** of a split (two blocks side by side: text + media, form + info);
- **each image** that stands on its own.

Rows come from the boxes (same top = same row, ordered by left), measured once at init.

## Variants and direction

Names say **where the element travels** (AOS convention); `from-*` aliases say where it starts.

```
 fade-right   ●──────▶   starts on the left, moves right     (alias from-left)
 fade-left    ◀──────●   starts on the right, moves left     (alias from-right)
 fade-up         ▲       starts below, moves up              (alias from-bottom)
                 ●
 fade-down       ●       starts above, moves down            (alias from-top)
                 ▼
```

| Variant | Motion |
|---|---|
| `fade` | opacity |
| `fade-up` / `fade-down` | opacity + vertical travel (`--lz-dist`) |
| `fade-left` / `fade-right` | opacity + horizontal travel (`--lz-dist-x`) |
| `zoom-in` | opacity + scale .94 → 1 |
| `mask-up` | headings: revealed upward through a mask while rising (no opacity) |
| `mask-wipe` | images: a wipe in the column's direction (`data-lz-dir` right / left / up) |
| `rise-scale` | cards: up + slight scale (featured pricing card) |

## Patterns for groups of items

`data-lz-pattern` on the section or on the container of the items (it wins).

| Pattern | Effect |
|---|---|
| `cascade` | all `fade-up`, staggered left to right |
| `alternate` | odd/even items enter from opposite sides (FAQ, steps, timeline) |
| `converge` | in a row, items left of center travel right, right of center travel left, the center rises |
| `center-out` | stagger by distance from the center (stats, logos) |
| `wave` | diagonal: by column inside a row, rows one after another (galleries) |
| `none` | the items don't animate |

On stacked (single-column) layouts every pattern becomes `cascade` **except `alternate`**, which
keeps a short sideways travel (`--lz-dist-x` is ~20 px on a phone).

## Contract (additive)

| Attribute | On | Effect |
|---|---|---|
| `data-lz-motion="calm\|editorial\|none"` | root wrapper (`.lz-page`) | Preset for the whole page. Default `calm`; `none` disables choreography (the runtime isn't even injected unless v1 attributes are present). |
| `data-lz-progress` | root wrapper | Opt-in scroll progress bar (CSS `animation-timeline: scroll()` only). |
| `data-lz-section="hero\|about\|cards\|steps\|timeline\|gallery\|stats\|testimonials\|pricing\|team\|faq\|contact\|cta\|footer\|none"` | each section | Recipe below. `text` (v2) = `about`; unknown values behave as `about`; `none` opts out. |
| `data-lz-pattern="cascade\|alternate\|converge\|center-out\|wave\|none"` | section or item container | Overrides the recipe's pattern. |
| `data-lz-featured` (or a `featured\|popular\|destacad…` class) | an item | `rise-scale` instead of its side. |
| `data-lz-reveal="none"` | any node | Opts that node and its subtree out. |
| any v1 attribute | a node inside a section | Override (its own variant, delay, duration, stagger step or word split). |

### Recipes by section type

One primary + one secondary motion per group.

| Section | Choreography |
|---|---|
| `hero` | eyebrow `fade-down`; headline word by word through a mask; lead `fade-up`; CTAs cascade; image settles (`scale`), or slides in from the right when it is the right column. From first paint. |
| `about` | split columns converge (text and media travel toward the center; media with `mask-wipe`); stacked: `fade-up` |
| `cards` | `converge` per row, rows cascade |
| `steps`, `timeline` | `alternate` |
| `gallery` | `mask-wipe` + `wave` |
| `stats` | `center-out`; numbers count up (v1 counter; numeric text like `+1,200`, `4.9`, `98%` is detected, bare years are not) |
| `testimonials` | `alternate`; a sideways carousel just fades |
| `pricing` | `converge`; the featured card `rise-scale` |
| `team` | `cascade` |
| `faq` | `alternate` (left/right per item; the native `<details>` toggle is untouched) |
| `contact` | form and info converge |
| `cta` | heading `zoom-in`, button `fade-up`, soft accent glow drifting behind (CSS `::before`) |
| `footer` | a plain `fade`, no stagger (each footer block fades as it arrives) |

In every recipe the first heading of a section uses `mask-up`, the rest of the text `fade-up` (or the
column's direction). Navbar, floating buttons and marquees are not tagged.

### Motion tokens

Defined with `:where()` (zero specificity), so a template can override any of them in its `:root`.

| Token | `calm` (default) | `editorial` |
|---|---|---|
| `--lz-dur` | 700ms | 900ms |
| `--lz-media-dur` | 1000ms | 1250ms |
| `--lz-dist` (vertical) | `clamp(20px, 6vw, 56px)` | `clamp(24px, 8vw, 72px)` |
| `--lz-dist-x` (horizontal) | `clamp(16px, 5vw, 64px)` | `clamp(18px, 6vw, 80px)` |
| `--lz-ease` | `cubic-bezier(.22,.61,.36,1)` | `cubic-bezier(.16,1,.3,1)` |
| `--lz-stagger` | 70ms | 80ms |
| `--lz-word-step` | 40ms | 50ms |

Below 768 px durations are multiplied by `--lz-dur-k: 1.2` and both presets use the firmer
`cubic-bezier(.16,1,.3,1)`. Cascades are capped at 6 steps, words at 16.

### CSS-only helpers (Pro stylesheet)

`lz-hover-lift` (lift on hover) · `lz-hover-zoom` (frame that zooms its `img` on hover) ·
`lz-fill-hover` (button fill sweeps in on hover; `--lz-fill`, `--lz-fill-text`) ·
`lz-marquee` (the single child scrolls; duplicate its content once; `--lz-marquee-dur`) ·
`lz-stack` (children stack as sticky cards; `--lz-stack-top`). All off with reduced motion.
A sticky/fixed `<header>` gets `.lz-header`; `html.lz-scrolled` toggles from a sentinel element (the
`centered-logo` navbar slides its top row away with it). In-page nav links (`header a[href^="#"]`) get
`.lz-active` + `aria-current` for the section crossing 35 % of the screen, re-evaluated on every
observer callback (no scroll listener).

## v1 attributes (version-stable)

Outside a `data-lz-section` they behave as in v1, with two fixes: nested reveals share the outermost
reveal's trigger (they used to fire independently), and staggers are clamped to 16 steps. Inside a
section they are overrides played by the group they fall in.

| Attribute | On | Effect |
|---|---|---|
| `data-lz-reveal="<variant>"` | any element | Animates in when it enters the viewport. Any v3 variant or alias; v1 names keep working (`zoom` = `zoom-in`, `slide-left` = `fade-left`, `slide-right` = `fade-right`). Default `fade-up`. `none` opts out. |
| `data-lz-delay="ms"` / `data-lz-duration="ms"` | reveal element | Extra delay (default 0) and duration (default: the preset's `--lz-dur`). |
| `data-lz-stagger="ms"` | parent | Its children reveal in sequence, `ms` apart (default 90). An optional `data-lz-reveal` on the parent names the children's effect; a child's own `data-lz-reveal` wins. |
| `data-lz-words` / `data-lz-words="ms"` | text element | Word-by-word reveal (default 45 ms apart; the preset's `--lz-word-step` inside a section), each word revealed through a mask. Inline markup survives; its words are split too. |
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
    <ul><li>Corte</li><li>Barba</li><li>Color</li></ul>          <!-- converge: ▶ ▲ ◀ -->
  </section>
  <section data-lz-section="faq">
    <details open>…</details><details open>…</details><details open>…</details>   <!-- ▶ ◀ ▶ -->
  </section>
  <section data-lz-section="gallery" data-lz-pattern="center-out">…</section>
  <section data-lz-section="about">
    <h2 data-lz-reveal="from-left">Override con alias</h2>
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

- **`content-visibility:auto`**: no paint cost to recover (TBT 0; the only long tasks are image
  decodes that also happen without the runtime) and it risks anchors and CLS.
- **Navbar entrance**: the header is above the fold and sticky; animating it would either hide it at
  first paint or slide it over the page. It stays static; the hero carries the entrance.

## Changing the contract

Attribute names and meanings above must keep working for sites already published (the runtime is
served to every Pro site at request time). Add new attributes or variants instead of changing
existing ones, update this document, run `build:motion` and check the gzip budget it prints.
