---
name: picker-respects-direction-rules
description: el compilador descarta variantes que rompen no-gradients antes de elegir (Básico ligero)
type: gotcha
date: 2026-10-27
commit: 97427ce
---

Con `layout.direction`, el compilador elige por rol la primera variante del arquetipo (en Básico, la de
menos CSS). No miraba las reglas de la dirección: `neon-nocturno` (bold) en Básico tomaba
`footer/signature-bar`, que lleva `linear-gradient`, y todo spec nuevo con esa dirección fallaba en
`kit:validate` (`no-gradients`), también en gimnasio. Ahora `breaksDirection` (en `compile.ts`) filtra
esas variantes al elegir; las legacy con velo funcional siguen exentas, igual que en `directionFindings`.

**Why:** apareció al crear el giro academia-combate; relajar la regla o editar el arquetipo por giro
habría escondido el problema. Las plantillas existentes no cambian: sus locks fijan la elección.
**How to apply:** una regla de dirección nueva que dependa del CSS de una variante debe filtrarse en
`breaksDirection` además de comprobarse en `directionFindings`. Relacionado: [[template-art-directions]],
[[spec-direction-archetype-wiring]].
