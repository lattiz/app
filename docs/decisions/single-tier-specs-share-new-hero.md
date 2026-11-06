---
name: single-tier-specs-share-new-hero
description: Un twin evita la portada de su Pro; para que ambos usen la sección nueva, dos specs de un tier
type: gotcha
date: 2026-11-06
commit: b362412
---

En un spec `twin` el compilador cambia la portada de la Básica si coincide con la de su Pro (`portada: hero/X → hero/Y (única en el giro)`), aunque la fijes en `sections.basico`. Para que Básica y Pro usen las mismas secciones nuevas (`hero/spotlight-card`, `about/build-panel`, `services/flavor-cards`), el par Pulpa son dos specs de un solo tier: `tienda-pulpa-v1` (Pro) y `tienda-base-pulpa-v1` (Básico). Las dos copias de copy deben ser distintas (aviso `repetido`).

**Why:** modificar el compilador para eximir al par de la regla de portada habría tocado el build de todo el kit y el snapshot. Dos specs sin `twin` no tienen `sibling`, y solo cuenta la unicidad de portada entre Pro.
**How to apply:** si un par debe compartir portada, no uses `twin`; paleta y par tipográfico de la Básica van en su propio `brand` (tono del acento ≥ 30° del Pro). Otros hallazgos de la ronda: una portada extended exige `data-lz-fit` (test `extended-sections`) y `kit probe` rechaza texto < 14 px; `restaurante` y `gimnasio` no tenían tono libre para el oliva, `tienda` sí ([5°, 72°]), ver [[twin-accent-hue-split]] y [[viewport-fit-system]].
