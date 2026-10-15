---
name: twin-accent-hue-split
description: Pro y Básico gemelos no pueden compartir paleta ni tono de acento; el rango libre azul es 185–277°
type: gotcha
date: 2026-10-14
commit: 670f0a1
---

Un par gemelo (Pro + Básico del mismo giro) necesita acentos a ≥ 30° de tono entre sí y de todas las plantillas del giro. Pinear la misma paleta en `overrides.basico.brand` no basta: el compilador la rechaza («choca con otra plantilla del giro») y elige otra.

En restaurante el único rango libre de tono está entre 185° y 277° (el azul). Por eso La Nota Azul usa dos paletas: Pro en `pal-marino-ladrillo-neon` (199°) y Básico en `pal-ladrillo-indigo-neon` (246°).

**Why:** la regla del acento protege la diversidad del giro, y el gemelo cuenta como otra plantilla. Descartado: subir el límite o relajar la regla por un caso.
**How to apply:** antes de pinear una paleta para un gemelo, mira `pnpm lattiz giro show <giro> --json` (`freeHueRanges`). Si el rango libre no alcanza para dos tonos a 30°, crea una segunda paleta en `palettes/seeds.ts` en vez de forzarla. Ver [[template-palette-library]].
