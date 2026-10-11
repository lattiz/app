# Template patterns: Básico vs Pro

**Básico = "bonito y rápido"** (it must never look cheap). **Pro = "memorable".**
Tiers come from one place: `packages/template-kit/src/tiers.ts` for templates and
`templateAccess.proIncluded` (API, same policy as Pro templates) for editor extras.
See also `docs/lattiz-motion.md` and `packages/template-kit/CLAUDE.md`.

## What each tier gets

| | Básico | Pro |
|---|---|---|
| **Movement** | CSS only: hover zoom, smooth scroll, the marquee in templates that have one. Always static on load. | Lattiz Motion (`data-lz-*`): reveals, stagger, word reveal, counters, parallax, lightbox, before/after, countdown, open-now. Injected only for live Pro subscriptions. |
| **Structure** | 6–7 counted sections; skins of one structure per vertical (similarity ≤ 0.85). | 8–10 sections, each Pro template distinct (similarity ≤ 0.5), editorial grids, sticky and horizontal sections. |
| **Editor section kit** | Portada simple, Servicios en tarjetas, Galería en cuadrícula, Contacto y horario. | Básico kit + Portada editorial, Cinta en movimiento, Tarjetas apiladas, Galería deslizable, Antes y después, Cifras animadas, Barra de promoción, Abierto ahora, Menú con pedido por WhatsApp. |
| **Theme ("Tema")** | 4 palettes (Clásico, Noche, Terracota, Bosque). | + 8 palettes, each with a dark variant, and 6 font pairings. |
| **Vertical modules** | Contact with `{{lz:*}}` tokens, hours summary, WhatsApp CTA. | + open-now badge, WhatsApp order cards (menu/products), promo bar with countdown, before/after for results-driven verticals (barbería, estética, dental). |
| **Business data** | `{{lz:*}}` tokens + LocalBusiness JSON-LD. | Same, plus motion widgets that read it (open-now uses `#lz-ld`). |

Section kit sources: `apps/web/src/features/editor/blocks/` (one component definition per
block, CSS included, `lzb-` classes reading the template's `--lz-*` tokens with fallbacks).
Theme presets: `apps/web/src/features/editor/theme-presets.ts` (every palette checked to
WCAG AA 4.5:1 for text, muted text, accent text and text on accent).

## CSS-only patterns (Básico-safe)

All of these work without JavaScript and need a `prefers-reduced-motion` fallback when
they move.

**Fluid type with `clamp()`**: one declaration, no breakpoints.
```css
.title { font-size: clamp(32px, 5vw, 64px); line-height: 1; }
```

**Text/logo marquee**: duplicate the group once and mark the copy `aria-hidden`.
```css
.track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
.track:hover { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .track { animation: none; } }
```

**Sticky stacked cards**: each card sticks a bit lower than the previous one.
```css
.card { position: sticky; top: calc(80px + var(--i, 0) * 24px); }
.card:nth-child(2) { --i: 1; } .card:nth-child(3) { --i: 2; }
@media (max-width: 992px) { .card { position: relative; top: auto; } }
```

**`scroll-snap` carousel**: native swipe, no JS, keyboard-scrollable.
```css
.track { display: grid; grid-auto-flow: column; grid-auto-columns: min(78%, 420px);
  gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; }
.track > * { scroll-snap-align: start; }
```

**Native accordion**: `<details>/<summary>`. In templates use `<details open>`: the editor
canvas cannot open a closed `<details>` (see decision `faq-details-open-editor`).

**Hover zoom**: transform only, clipped by the parent.
```css
.frame { overflow: hidden; } .frame img { transition: transform .4s ease; }
.frame:hover img { transform: scale(1.03); }
@media (prefers-reduced-motion: reduce) { .frame img { transition: none; } }
```

**Not CSS-only:** a draggable before/after slider needs JS (range input + `clip-path`).
Use `data-lz-compare` (Pro). Without the runtime both images simply stack.

**Scroll-driven animation** (`animation-timeline: view()`) only as progressive
enhancement: Firefox doesn't support it, so the static state must be the finished state.
```css
@supports (animation-timeline: view()) {
  .reveal { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
}
@keyframes rise { from { opacity: 0; transform: translateY(24px); } }
```

## Seeding with motion

`scripts/parse-and-seed-template.ts --motion calm|editorial|none` (default: the manifest's
`motion.preset`, else `none`) tags every section of the `.grapesjs` component tree and of the
preview with `data-lz-section` and the root wrapper (`.lz-page`) with `data-lz-motion`. No inner
node is decorated: the Lattiz Motion v2 runtime derives the choreography from the section type
(`docs/lattiz-motion.md`). Navbar, floating WhatsApp and marquee are never tagged.

Types come from a classifier over the exported HTML, first match wins: `footer` (tag or slot) →
`hero` (has the `<h1>`, or first section) → `stats` (≥ 3 bare numbers, ≥ 1 per 4 text blocks;
prices and years don't count) → `gallery` (≥ 3 images, ≥ 1 per 2 text blocks) → `cards`
(≥ 3 look-alike siblings; runs of plain `<p>` don't count) → `cta` (last section with a
button) → `text`. Every run prints the table (also with `--dry-run`). When a section is
mis-typed, fix it in the manifest, never by hand in the HTML:

```ts
motion: { preset: 'editorial', sections: { about: 'text', '#galeria': 'gallery', 6: 'none' } },
```

Keys are a slot name, `#id` or the table's index. Precedence: manifest override > a
`data-lz-section` already in the source > classifier. Re-running produces the same attributes.
`editorial` galleries also get `data-lz-lightbox`. Pro previews inline the runtime; Básico
previews stay static because Básico tenants never receive it. Section-kit blocks in the editor
(`apps/web/src/features/editor/blocks`) ship with `data-lz-section` already set.
