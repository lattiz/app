---
name: locations-sin-mapa
description: map-link (Pro) y single-card (Básico) admitidas en blueprints; single-card es sucursal única
type: gotcha
date: 2026-10-22
commit: 05f2733
---

`locations/map-link` (Pro) y `locations/single-card` (Básico) existían y el módulo `ubicacion-ligera`
las proponía, pero `blueprints/service-landing.{pro,basic}.ts` no las listaban en `contact.variants`:
ningún spec podía usarlas y toda plantilla salía con el recuadro gris del iframe de mapa. Ahora están
admitidas. Además `compile.ts` (`anchorOf` y `tierCopy`) trataba solo `single` como sucursal única:
`single-card` no recibía `{{branch}}` ni el ancla `#ubicacion` y el build del Básico fallaba.

**Why:** se detectó al renovar Casa Confeti y La Nota Azul (mapa gris en las 7 renovaciones previas).
Las plantillas ya publicadas no cambian: sus locks fijan la variante elegida.
**How to apply:** una variante nueva de `locations` necesita entrar en `contact.variants` del blueprint
de su tier; si es de una sola sucursal, sumarla a la condición de `single` en `compile.ts`.
Relacionado: [[template-renewal-flag]], [[extended-section-variants]].
