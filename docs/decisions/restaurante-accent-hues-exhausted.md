---
name: restaurante-accent-hues-exhausted
description: restaurante casi sin tonos de acento libres; una paleta de Stitch puede no entrar por ΔE00
type: gotcha
date: 2026-10-20
commit: 81f7e97
---

En restaurante solo queda libre el tono de acento ~276–277° (HSL), así que un par gemelo nuevo no admite dos acentos cromáticos: Casa Rosa Mantequilla quedó con acento lavanda-ciruela en el Pro y uno neutro de croma bajo (exento de la regla de tono) en el Básico. La paleta pastel de su candidato de Stitch tampoco se pudo promover: quedó a ΔE00 13.3 de `pal-granada` (mínimo 15), y con `layout.direction: cantera-editorial` el compilador vuelve a su paleta gris.

**Why:** la regla de ≥ 30° entre acentos del giro ([[twin-accent-hue-split]], [[template-palette-library]]) y la compuerta ΔE00 de `design promote` ([[stitch-design-source]]) son correctas; el giro simplemente está lleno.
**How to apply:** antes de prometer un mood de color en restaurante, mira `freeHueRanges` en `pnpm lattiz giro show restaurante --json`. Para un color fuera de la dirección hay que quitar `layout.direction` y fijar `brand.palette.custom`, `fontPair`, `style`, `archetype` y variantes a mano. Un candidato de Stitch archivado por ΔE00 sigue sirviendo como referencia visual.
