---
name: new-sections-budgets-and-gotchas
description: secciones Stitch ricas: presupuesto crudo subido, nojs con hijos ocultos, lookup por ámbito, ancla de contacto
type: gotcha
date: 2026-10-23
commit: 58a535c
---

Cuatro hallazgos al renovar `restaurante-ceniza` con diez secciones nativas (`navbar/index-strip`, `hero/vertical-slip`, `hero/split-mosaic`, `about/coal-log`, `services/chalk-board`, `faq/rule-table`, `gallery/contact-sheet`, `testimonials/order-slips`, `locations/table-map`, `footer/receipt`).

1. **Presupuesto crudo.** Un par con secciones nuevas ricas no cabía en el CSS/HTML crudo de `budgets.json` (Básico 32 KiB de CSS, Pro 41 KiB) aunque el gzip sí. El CSS compilado ya sale minificado: compactar el archivo de la sección no ayuda. Se subieron solo los límites crudos (Básico CSS 28→33 y HTML 48→53 KiB; Pro CSS 38→42 y HTML 67→72 KiB); gzip e imágenes quedan igual. Un spec nuevo falla el presupuesto en su primer build; al reconstruirlo ya solo avisa: no uses eso para colar peso.
2. **Fotos en el Básico.** El presupuesto de imágenes del Básico (175 KiB) no admite un mosaico de cuatro fotos: las losetas pueden ser solo texto (`tiles[].photo?`) y el hero del Básico puede usar su propia clave (`product-01`) para no heredar la foto de 128 KiB del Pro.
3. **`lookup` cae al ámbito de la sección.** Dentro de `data-lz-each`, una clave que el elemento no trae se resuelve con la de la sección (`image` del hero). Un campo opcional por elemento necesita un nombre propio (`photo`, no `image`) o `data-lz-if` lo da por presente.
4. **Reglas del probe y de `check`.** `nojs` marca los `p/li/h` hijos de un contenedor con `display:none` (solo exime al elemento mismo): oculta también a los hijos con `.cont *` y repite el selector de `li` (la especificidad de `.lista li` gana). Una variante de contacto usada en Pro y Básico necesita `id="sucursales"` y un ancla `<span id="ubicacion">`: el probe del Básico enlaza `#ubicacion`. `copySource` exige `title` en el sample si el giro no lo trae (testimonios).

**Why:** cada uno costó una vuelta de build o de probe; ninguno se ve en el diseño.
**How to apply:** al construir una variante para ambos tiers, revisa estos cuatro puntos antes de `kit probe`. Ver [[template-byte-budgets]], [[hero-fit-stacked-copy-first]] y [[stitch-generation-lands-late]].
