---
name: hero-fit-stacked-copy-first
description: kit probe fit mide el bloque de texto si la foto va debajo; en móvil pon la foto al final con order
type: gotcha
date: 2026-10-21
commit: e88d2a3
---

`kit probe` (regla `fit`, `measureFit` en `src/lib/shots.ts`) acepta un hero que no cabe entero si la imagen queda **debajo** del bloque de texto y ese bloque (todo lo que no es `<img>`) mide ≤ 90 % de `100svh − header` con el CTA visible. Una foto encima del texto o datos por debajo de la foto lo hacen fallar en 360 y 390.

**Why:** `hero/index-panel` (foto con panel superpuesto + franja de datos) falló el `fit` en móvil hasta apilarlo con `order`: regla, panel, datos y foto al final (`.stage { display: contents }` y contenedor flex). La variante `largo` de `kit probe` mete 8 elementos por lista: una franja de datos con una fila fija se recorta con `grid-template: auto / repeat(3, 1fr); grid-auto-rows: 0; overflow: hidden` (sin `grid-template-rows` explícito la fila 1 también mide 0 con `grid-auto-rows: 0`). `display: none` no sirve ([[bento-facts-visible-mobile]]). Tampoco sirven `facts[].value` (tope de 10 caracteres de `COPY_LIMITS`): usa otra clave (`info[]`).
**How to apply:** en un hero nuevo con foto, diseña primero el móvil con el copy arriba y la foto al final; los extensos no admiten `<iframe>` (el contacto usa un plano SVG). Ver [[viewport-fit-system]] y [[extended-section-variants]].
