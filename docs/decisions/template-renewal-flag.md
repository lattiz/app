---
name: template-renewal-flag
description: rehacer una plantilla = spec -v2 con version + renews; hereda paleta/par; v1 se retira a mano
type: project
date: 2026-10-20
commit: 851a9d6
---

Un cambio grande de una plantilla existente (secciones, portada, estructura) se hace con un spec nuevo
`specs/<idBase>-v2.spec.json` copiado del viejo, con `version: 2` (ids `-v2`) y
`renews: { spec: "<stem viejo>", keep?: ["palette","fontPair"] }`. Por tier hereda del lock viejo la
paleta y el par tipográfico por el camino del lock (si chocan o la dirección no los admite, falla; nunca
cambia en silencio), y la pareja vieja ↔ nueva queda fuera de todas las compuertas de unicidad
(`planSpec`, `kit:validate`, `compare-visual`, pares del snapshot) mientras conviven. Manifiesto y lock
graban `renews: <id viejo>`, así el spec viejo se puede borrar tras retirarlo.

**Why:** las compuertas ya excluían el id propio, así que rehacer en sitio no necesitaba bandera, pero
`template-workflow.md` §5 pide id nuevo para cambios grandes, y un id nuevo junto al viejo chocaba en par,
tono (restaurante casi sin tonos, [[restaurante-accent-hues-exhausted]]), ΔE, portada y similitud.
Descartado: rehacer en el mismo `-v1` (rompe la regla de versiones, el hero conserva sus bytes viejos y los
presupuestos solo avisan) y relajar compuertas para un caso. No se heredan forma ni estilo: los trae el
diseño nuevo. Verificado: La Insignia v2 con la v1 presente compila sin choques de unicidad; solo fallan
los presupuestos de bytes (correcto para id nuevo).
**How to apply:** `docs/template-spec.md` «Renovar una plantilla». El seed nunca desactiva la vieja: avisa
si sigue activa y se retira en `/admin`; luego se borran sus archivos (no los objetos de R2). Antes de borrar la
v1, busca su id en `golden/snapshot.json`: `kit:snapshot:add` graba los pares vivos del giro, y un spec que
la tenga en `peers` falla al verificar si desaparece ([[snapshot-recorded-inputs]]). Re-grabar ese spec
con sus pares de antes (como se hizo con la-nota-azul, `b51a83b`) o sacarla de su lista con una razón en el
commit. La v2 no la graba: `renews` la excluye. Gemelos [[twin-accent-hue-split]] y lock
[[template-catalog-versioning]] siguen igual.
