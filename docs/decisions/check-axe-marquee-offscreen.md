---
name: check-axe-marquee-offscreen
description: axe con el runtime de Motion mide los ítems recortados del marquee contra el fondo
type: gotcha
date: 2026-10-11
commit: 61ce4c1
---

`lattiz check` daba FAIL de contraste (1.08:1) en los ítems de `marquee/ticker` que quedan fuera de la pantalla en Pro con fondo claro: con el runtime de Motion cargado, axe resuelve su fondo como el de la página y no la banda de acento (sin runtime, o sobre `dist/index.html`, no hay violación; ÓXIDO no falla porque su texto sobre acento es oscuro como su fondo). El par real `on-accent`/`accent` pasa AA. `check` ahora ignora nodos que no caben completos en el ancho de la pantalla.

**Why:** ese texto o es desbordamiento (ya lo marca la regla de overflow) o está recortado a propósito; no se puede juzgar en ese tamaño.
**How to apply:** si axe reporta 1.0x:1 con el fondo de la página en un elemento sobre una banda de color, revisa si está fuera de la pantalla antes de tocar la paleta. Ver [[lattiz-motion-runtime]].
