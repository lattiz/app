---
name: page-archetypes-data
description: 8 arquetipos y módulos por giro como datos en archetypes/; WP8 los conecta y registra cta
type: project
date: 2026-10-12
commit: fbc6d79
---

`packages/template-kit/archetypes/` guarda los 8 arquetipos (diales, presets de WP3, Motion, variante preferida por rol y tier, giros, espécimen), la familia de composición de cada variante y 10 módulos verticales con el copy es-MX de las claves nuevas por giro. El compilador todavía no los lee: ningún spec cambia. El slot `cta` existe (variante `cta/band`, el clasificador de Motion ya lo mapea) pero su rol aún no está en `blueprints/` ni en `src/tiers.ts`; hoy solo lo usan `kit probe` y `kit archetypes` con un blueprint en memoria (`CompileSources.blueprint`).

**Why:** registrar roles y conectar arquetipos toca el compilador y la elección de specs (WP8, Parte 3); dejarlo como datos probados permite revisarlos en `.lattiz/gallery/archetypes.html` sin riesgo para lo publicado. Las reglas anti-genérico se volvieron test (≥ 4 familias, nunca tres «imagen + texto» seguidas): tres Básicos fallaban y se corrigió la composición, no la regla.
**How to apply:** en WP8, mapear `Archetype.blueprintArchetype` a arquetipos reales del blueprint, añadir `cta` como rol opcional (en Básico obliga a quitar `about` para seguir en 7), listar las variantes nuevas de `about`/`locations` en los blueprints y mover `meta.sample` + `verticals.ts` a `giros/`. Ver [[extended-section-variants]].
