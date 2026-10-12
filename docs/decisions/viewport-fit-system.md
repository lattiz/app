---
name: viewport-fit-system
description: Secciones de composición caben en 90 % de 100svh − header; opt-in con data-lz-fit
type: project
date: 2026-10-11
commit: 5ac23f7
---

Los temas emiten `--lz-header-h` (cada variante de navbar declara su alto real en `:root`), `--lz-avail: calc(100svh - var(--lz-header-h))` y `--lz-fit` (90 %). Las secciones de composición (hoy `hero/split` y `hero/image-bg`) llevan `data-lz-fit` y se dimensionan por ancho **y** alto: tipografía con tope en `svh`, media con `max-height` ligado a `--lz-fit`, paddings en `svh`; `@media (max-height: 560px)` vuelve al flujo natural. Las secciones de contenido (servicios, FAQ, galería, about con copy largo) fluyen. `kit:shots` reporta PASS/FAIL por viewport; en héroes apilados (móvil) basta con que titular + lead + CTA quepan.

**Why:** a 1366×768 el CTA de Norte quedaba bajo el pliegue y el de ÓXIDO en todos los escritorios (hero a `100vh` sin descontar el header, titular de 150–168 px). `svh` y no `dvh`/`vh` para que la barra del navegador móvil no haga saltar el layout. Se descartó forzar el about de ÓXIDO: su columna de texto es lo alto y encogerla dañaba la lectura. El header de Norte medía 130 px (no ~290 como decía el brief).

**How to apply:** una variante nueva de navbar declara `:root { --lz-header-h }` con su alto real (y en 992/480), sumando `var(--lz-border-width)` si el borde del header viene del tema (con borde de 2 px el hero se pasaba 1 px). Una sección que debe caber en pantalla: `data-lz-fit` en su raíz, `min-height: min(var(--lz-fit), var(--lz-fit-max))`, nada de `overflow: hidden` para esconder lo que sobra, y verificar con `pnpm template:shots <id>`. Ver [[template-rhythm-tokens]], [[lattiz-motion-runtime]].
