---
name: catalog-manifest
description: catalog.manifest.json generado por kit:manifest; --check en pnpm lint; la API no importa el kit
type: project
date: 2026-10-14
commit: 176002c
---

`packages/template-kit/catalog/catalog.manifest.json` describe cada variante (tiers, `proOnly`, roles, `contentKeys`, anclas, `fit`, Motion por slot), los hooks del runtime de Motion, arquetipos, paletas, pares y giros. Lo escribe `pnpm --filter @lattiz/template-kit kit:manifest`; `kit:manifest --check` falla si quedó viejo y corre dentro de `pnpm lint`. Tipos sin imports en `catalog/types.ts`. Una variante sin tier declarado ni blueprint no es «solo Pro»; el generador falla si una plantilla Básica usa una variante solo Pro.

**Why:** los bloques del editor y el filtro por plan vivían a mano en `apps/web` sin relación con `sections/`, y la API no conocía el catálogo. No existe `meta.motion`: el tipo de Motion sale de `SLOT_TYPES` en `scripts/lib/motion-sections.ts` (se lee el texto, no se toca el seed). La API no depende del kit ni de un paquete nuevo: su imagen usa `pnpm deploy --prod --legacy`, que asume cero dependencias del workspace, y no se pudo probar Docker; se descartó por ahora `@lattiz/catalog`.
**How to apply:** tocar una sección, paleta, par, arquetipo o giro → `kit:manifest` y commitear el JSON. La API y el editor consumen el mismo subconjunto generado, y `apps/web` también recibe bloques e identidad por plantilla generados (ver [[schema-plan-guard]], [[editor-plan-catalog]], [[editor-kit-blocks]]). Ver [[template-catalog-versioning]], [[extended-section-variants]].
