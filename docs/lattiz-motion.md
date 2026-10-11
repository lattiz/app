# Lattiz Motion (v1)

A small runtime (~4.4 KB gzip, budget 8 KB) that turns declarative `data-lz-*`
attributes into motion and interactive widgets **on published Pro sites only**.
It is our own code: ScrollReveal (GPLv3/commercial) and GSAP (licence forbids
no-code animation builders) were ruled out.

- Source: `apps/tenant-sites/lib/lz-motion/src/{runtime.js,style.css}`.
- Build: `pnpm --filter @lattiz/tenant-sites build:motion` minifies with esbuild
  into the committed `lib/lz-motion/runtime.generated.ts` and fails above 8 KB gzip.
- Injection: `app/route.ts` → `injectMotion()` as the last serve-time step, only when
  `get_public_tenant_site().is_pro` (serving + entitled + Pro plan) **and** the HTML
  contains a motion attribute below. Template-kit's own `data-lz-slot|variant|key|…`
  do not trigger it.
- The editor canvas never loads it, so the attributes are inert there; a Básico site
  with the same HTML renders static and fully visible.

## Rules

1. **Progressive enhancement.** The runtime adds `lz-js` to `<html>`. Hidden states
   exist only on elements the runtime itself marked `.lz-hide`; without JS nothing hides.
2. **LCP safety.** Elements in the first viewport at load are never hidden.
3. **Failsafe.** If the IntersectionObserver hasn't reported within 2.5 s, everything
   pending is revealed. A module that throws is skipped (each runs in its own try/catch).
4. **Reduced motion.** With `prefers-reduced-motion: reduce` nothing is hidden, words are
   not split, counters show the final value and parallax is off. Lightbox, compare,
   countdown and open-now keep working (they are functional, not decorative).
5. **Transform/opacity only** for animation.

## Attribute contract (version-stable)

| Attribute | On | Effect |
|---|---|---|
| `data-lz-reveal="fade-up\|fade\|zoom\|slide-left\|slide-right"` | any element | Animates in when it enters the viewport. Default `fade-up`. |
| `data-lz-delay="ms"` / `data-lz-duration="ms"` | reveal element | Delay (default 0) and duration (default 700). |
| `data-lz-stagger="ms"` | parent | Its children reveal in sequence, `ms` apart (default 90). An optional `data-lz-reveal` on the parent names the children's effect; a child's own `data-lz-reveal` wins. |
| `data-lz-words` / `data-lz-words="ms"` | text element | Word-by-word reveal (default 45 ms apart). Only direct text is split; inline markup survives. |
| `data-lz-counter="1200"` (+ `data-lz-prefix`, `data-lz-suffix`, `data-lz-duration`) | element | Counts from 0 to the value (es-MX format, decimals kept from the value). Write the final value as the element's text for no-JS visitors. |
| `data-lz-parallax="0.2"` | element | Vertical parallax, factor clamped to −1…1. |
| `data-lz-lightbox` | `<img>` or a container of images | Click/Enter opens a dialog; ←/→ move through the container's images; ESC or the backdrop closes; focus is trapped and restored. `data-lz-full` on an image sets a larger source. |
| `data-lz-compare` / `data-lz-compare="30"` | container with two `<img>` (before, after) | Before/after slider (range input + `clip-path`), starting at the given percent (50). |
| `data-lz-countdown="2026-12-31T23:59:00-06:00"` | element | Live countdown. Children with `data-lz-unit="days\|hours\|minutes\|seconds"` are filled individually; otherwise the text becomes `3d 04:12:09`. At zero adds `.lz-expired` and shows `data-lz-expired-text` if set. |
| `data-lz-open-now` (+ `data-lz-open-text`, `data-lz-closed-text`) | element | "Abierto ahora" / "Cerrado" from the business hours in `#lz-ld` (JSON-LD, timezone in its `data-lz-tz`) or from `data-lz-open-hours='{"mon":[{"open":"09:00","close":"19:00"}]}'` (+ optional `data-lz-tz`). Sets `data-lz-state="open\|closed"`, toggles `.lz-open-now` / `.lz-closed-now`, refreshes every minute; overnight ranges supported. |

## Examples

```html
<section data-lz-reveal="fade-up">…</section>

<ul data-lz-stagger="120" data-lz-reveal="zoom">
  <li>Corte</li><li>Barba</li><li>Color</li>
</ul>

<p><strong data-lz-counter="1200" data-lz-prefix="+">+1,200</strong> clientes</p>

<div data-lz-compare>
  <img src="antes.webp" alt="Antes" width="800" height="600">
  <img src="despues.webp" alt="Después" width="800" height="600">
</div>

<span data-lz-open-now class="badge">Horario</span>

<p data-lz-countdown="2026-12-24T20:00:00-06:00" data-lz-expired-text="¡Promoción terminada!">
  <span data-lz-unit="days">0</span>d <span data-lz-unit="hours">00</span>:<span data-lz-unit="minutes">00</span>
</p>
```

## Changing the contract

Attribute names and meanings above are v1 and must keep working for sites already
published. Add new attributes instead of changing existing ones, update this table,
run `build:motion`, and check the gzip budget it prints.
