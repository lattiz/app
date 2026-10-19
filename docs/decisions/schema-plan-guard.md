---
name: schema-plan-guard
description: SchemaPlanGuard en guardar/publicar; SCHEMA_PLAN_ENFORCEMENT report por defecto; exime lo de la plantilla
type: project
date: 2026-10-14
commit: 3c98c22
---

`apps/api/src/modules/sites/schema-plan-guard.service.ts` revisa en el servidor, al guardar y al publicar, los pares `data-lz-slot`/`data-lz-variant` que el manifiesto marca solo Pro (y los atributos de Motion) cuando el plan del tenant no incluye Pro (`proIncluded`). Exime lo que la plantilla actual del tenant ya traía; una plantilla Pro sobre plan sin Pro es `downgraded` (solo aviso); los atributos de Motion solos nunca bloquean. `SCHEMA_PLAN_ENFORCEMENT=off|report|enforce`, por defecto (y ante un valor inválido) `report`; `enforce` responde 403 `SECTIONS_REQUIRE_PRO`. La lista sale de `plan-catalog.generated.ts`, que escribe `kit:manifest`.

**Why:** el filtro de bloques por plan vivía solo en el cliente. En datos reales, un tenant Básico sobre la plantilla Básica legacy `barberia-v1` tiene `team` y `testimonials` (variante `urban-luxe`) heredados de su plantilla: sin la exención o con un conteo por slot, `enforce` lo bloquearía. Por eso solo cuentan variantes conocidas del manifiesto y se resta la plantilla. Los bloques `lzb-*` escritos a mano no se marcan (sin slot/variante); desde la Fase C su plan en el editor sale de la misma lista ([[editor-plan-catalog]]) y los bloques generados del kit sí llevan slot/variante.
**How to apply:** despliegue con `report`, ~1 semana leyendo `schema_plan_guard` en los logs, y solo sin falsos positivos `enforce` en `/opt/lattiz/.env` + reinicio del contenedor. Detalle, amenazas y huecos en `docs/template-kit-plan-enforcement.md`. Ver [[catalog-manifest]], [[template-access-by-plan]], [[plan-change-flow]].
