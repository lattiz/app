---
name: template-style-tokens
description: Presets de estilo opt-in (theme.style / brand.style) solo en extended; var() con respaldo
type: project
date: 2026-10-12
commit: 7b66734
---

Los looks nuevos (forma, superficie, densidad, separador, tratamiento de imagen, escala tipográfica, caja y tracking) son presets en `src/lib/style.ts`. Un tema con `style` emite tokens extra al final de `:root` (`--lz-card-*`, `--lz-img-*`, `--lz-gap*`, `--lz-divider`, `--lz-heading-scale`, `--lz-display-tracking`) y los de interacción (`--lz-ease-out`, `--lz-dur-press|ui|reveal`, `--lz-press-scale`); sin `style` no emite nada. En el spec van en `brand.style.*` y exigen `brand.catalog: "extended"`.

**Why:** cualquier token nuevo en `:root` cambiaría las 26 plantillas existentes; retroalimentar variantes viejas también. `brand.shape` y `brand.density` ya existían con otros valores, de ahí `brand.style`.
**How to apply:** una variante nueva lee cada token con el look de hoy como respaldo (`var(--lz-card-bg, var(--lz-color-surface))`) para funcionar bajo un tema legacy; con `offset` reserva `--lz-img-offset` de margen. Probar con `pnpm lattiz kit gallery --tokens` y `kit:verify-snapshot`. Ver [[template-catalog-versioning]], [[template-rhythm-tokens]].
