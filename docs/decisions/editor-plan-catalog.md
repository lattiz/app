---
name: editor-plan-catalog
description: plan de bloques del editor derivado del manifiesto; misma lista que la API; meta.tiers gana
type: project
date: 2026-10-17
commit: bfbd69a
---

`kit:manifest` escribe la misma lista de variantes y hooks solo Pro en `apps/api/src/modules/sites/plan-catalog.generated.ts` y en `apps/web/src/features/editor/blocks/plan-catalog.generated.ts`. Cada bloque del editor declara `kitVariant` (o `kitPrimitive`, o `editorOnly`) y `blocks/plan.ts` decide: Pro si su variante es solo Pro o su markup lleva un hook de Motion solo Pro. Un `meta.tiers` explícito gana al blueprint al calcular `proOnly` (por eso `hero/bento` es solo Pro). Sin Pro, los bloques Pro se ven con insignia y bloqueados, y el clic abre el aviso para mejorar; el contenido guardado no se toca. `plan.test.ts` (web) compara editor, manifiesto y API por cada variante y hook.

**Why:** la lista del editor era a mano y daba la galería a Básico mientras el kit y la API la trataban como Pro. Un endpoint de catálogo no hacía falta: el patrón de archivo generado ya existía para la API (que no puede depender del kit, ver [[catalog-manifest]]) y no tiene estado «inalcanzable», así que no hay lista de respaldo. Studio 1.1.1 inserta por clic un bloque `disable` sin llamar su `onClick`: el bloqueo real está en `blocks.appendOnClick` (arrastrar ya estaba bloqueado).
**How to apply:** bloque nuevo → `kitVariant`/`kitPrimitive` o `editorOnly`, nunca un tier a mano; cambio de tier en el kit → `kit:manifest` y los tres lados cambian juntos. Ver [[schema-plan-guard]], [[editor-kit-blocks]].
