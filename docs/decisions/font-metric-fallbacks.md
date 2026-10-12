---
name: font-metric-fallbacks
description: Fallback local con métricas de Capsize por fuente del tema; mayúsculas con size-adjust medido
type: gotcha
date: 2026-10-11
commit: 91fde87
---

Cada fuente de tema lleva una cara de respaldo local (Arial / Times New Roman / Courier New) ajustada con métricas de `@capsizecss/metrics` (`size-adjust`, `ascent/descent/line-gap-override`, vía `createFontStack` de `@capsizecss/core`) e insertada en `--lz-font-*` (`'Anton', 'Anton Fallback', sans-serif`). Así el texto no se reacomoda cuando Google Fonts termina de cargar. Los temas con display en mayúsculas usan un `size-adjust` de mayúsculas medido en Chromium (`CAPS_SIZE_ADJUST` en `src/lib/theme.ts`: Anton 70.94 %, Archivo Black 113.73 %).

**Why:** el CLS de carga de todas las plantillas venía de «Web font loaded» (0.12–0.21 en Lighthouse móvil) y el hero compacto del viewport-fit lo empeoró en Norte (0.12 → 0.20) al meter la imagen completa en la primera pantalla. Capsize calcula el ancho medio con minúsculas: para Anton en mayúsculas el respaldo quedaba ~40 % más ancho y partía el titular en una línea extra (ÓXIDO solo bajaba de 0.196 a 0.181). Con la medida de mayúsculas: Norte 0.002, ÓXIDO 0.004. Se descartó `font-display: optional` (en la primera visita se vería la fuente de respaldo) y precargar woff2 de Google (URLs versionadas e inestables).

**How to apply:** una fuente nueva en un tema funciona sola si está en `@capsizecss/metrics`; si el tema la usa en mayúsculas, mide el ratio (muestra en mayúsculas en la fuente web ÷ en Arial, con `canvas.measureText`) y agrégalo a `CAPS_SIZE_ADJUST`. Verifica con Lighthouse móvil (CLS) y que las capturas con fuentes cargadas sigan idénticas. Ver [[viewport-fit-system]].
