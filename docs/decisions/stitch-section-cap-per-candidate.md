---
name: stitch-section-cap-per-candidate
description: el tope de 6 secciones de Stitch es por candidato (marcador // Stitch: <id>), no global
type: project
date: 2026-10-20
commit: b90eb57
---

`design promote --section` cuenta solo los `meta.ts` cuyo marcador es `// Stitch: <id del candidato>`
(seguido de espacio o fin de línea) y para en 6 por candidato. El presupuesto de CSS (1.2 KB gzip), la
exigencia de `design fidelity` y `--allow-similar` no cambian.

**Why:** el código contaba todos los marcadores del kit (7, todos de `barberia-don-porfirio-01`) y cerraba
`promote --section` para cualquier candidato nuevo, mientras el comentario y `stitch-native-sections.md`
decían «por diseño/proyecto». Con el tope global, las tres plantillas renovadas habrían seguido
compartiendo el cuerpo de Don Porfirio. Descartado subir el tope global: no frena la inflación por diseño.
**How to apply:** una sección reconstruida a mano lleva `// Stitch: <candidato> (<sección>), rebuilt by hand`;
antes de crear, medir con `fidelity` y reutilizar lo que dé `match`. Ver [[stitch-native-reconstruction]].
