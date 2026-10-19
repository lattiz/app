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

- Casi todo ya existía: del diseño real solo la portada era nueva. El harvest reporta `existing` y `similar`; `promote --section` se
  niega ante parecidas (salvo `--allow-similar`), a 6 secciones de Stitch o con CSS > 1.2 KB gzip.
- Un giro puede estar saturado para una paleta (verde + plata en barbería): la compuerta de la biblioteca mira paletas, no
  plantillas; la paleta se aprovecha en otros giros y la dirección aporta portada, tipografía, estilo y voz.
- Roles de Stitch (Material): `primary` es el acento de marca, no «el más cromático».
- La clase raíz debe ser `lz-<slot>-<variante>` (lo exige el bloque del editor); el rojo/azul del poste no pueden ser literales.
- `ship`/`publish` fallan con un hero placeholder (`images[] «hero»`); `check` solo avisa.

**How to apply:** `docs/stitch-native-sections.md` (contrato, fidelidad, checklist). Antes de crear una sección corre
`design harvest` y reutiliza lo que diga `existing`/`similar`. Una variante nueva exige: `families.ts`, un arquetipo, el bloque en
`editor-blocks.ts` y `kit:manifest` (cambia manifiesto, hashes y datos generados de `apps/web`/`apps/api`). Ver
[[stitch-design-source]], [[editor-kit-blocks]], [[extended-section-variants]], [[twin-accent-hue-split]].
