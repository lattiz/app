---
name: stitch-native-reconstruction
description: Segundo camino: patrones de Stitch reconstruidos a mano como secciones nativas; frenos anti-inflación
type: project
date: 2026-10-19
commit: 3bf5dec
---

Los patrones de un diseño de Stitch que el kit no tiene se **reconstruyen a mano como secciones nativas** (markup `lz-*`,
CSS con tokens, sin JS, Básico + Pro, bloque del editor) en vez de importar HTML. Primer caso: `hero/photo-ribbon`, la dirección
`insignia-musgo` y el par La Insignia.

**Why:** una sección nativa hereda tokens, SEO, GA, WhatsApp y Motion Pro sin tocar `tenant-sites`; importar HTML (Modelo A) rompe
LCP, nojs y presupuestos. Lo que se aprendió al hacerlo:

- «Ya existe» se decide **midiendo** (`design fidelity`: layout de la sección de Stitch contra cada variante del slot con la misma
  copy; match ≤ 0.15), no por slot + tipo de layout. La primera versión confundió unas preguntas en tarjetas numeradas con `faq/grid`
  y dejó el cuerpo de La Insignia con variantes genéricas. Lo no medido es `reuse_candidate`; lo distinto va a `rebuild`. `promote
  --section` bloquea lo no medido, el tope de 6 secciones de Stitch y el CSS > 1.2 KB gzip.
- Un giro puede estar saturado para una paleta (verde + plata en barbería): la compuerta de la biblioteca mira paletas, no
  plantillas; la paleta se aprovecha en otros giros y la dirección aporta portada, tipografía, estilo y voz.
- Roles de Stitch (Material): `primary` es el acento de marca, no «el más cromático».
- La clase raíz debe ser `lz-<slot>-<variante>` (lo exige el bloque del editor); el rojo/azul del poste no pueden ser literales.
- Se reconstruyeron a mano `faq/numbered-cards`, `services/ritual-cards`, `testimonials/paper-trio`, `about/framed-craft`
  (la «sección de maestros» de Stitch era el oficio, no el equipo), `locations/booking-panel` y `footer/signature-bar`. Las dos
  últimas miden 0.2–0.25 (a la vista iguales; el esqueleto de la métrica es frágil), así que no cuentan como match.
- Los slots con variantes solo Pro se declaran en el blueprint; `variantOverrides` vale en el tier que lo admite y se ignora
  en el otro.
- `ship`/`publish` fallan con un hero placeholder (`images[] «hero»`); `check` solo avisa.

**How to apply:** `docs/stitch-native-sections.md` (contrato, fidelidad, checklist). Antes de reconstruir corre `design harvest` y
`design fidelity` por sección: reutiliza solo lo que mida `match`; lo demás se reconstruye. Una variante nueva exige: `families.ts`, un arquetipo, el bloque en
`editor-blocks.ts` y `kit:manifest` (cambia manifiesto, hashes y datos generados de `apps/web`/`apps/api`). Ver
[[stitch-design-source]], [[editor-kit-blocks]], [[extended-section-variants]], [[twin-accent-hue-split]].
