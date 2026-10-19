---
name: stitch-design-source
description: Stitch alimenta el diseño del kit (no la publicación); biblioteca de datos, harvester, promote con compuertas
type: project
date: 2026-10-18
commit: be15323
---

Google Stitch es la **fuente de diseño** del kit (Modelo B): `lattiz design gen|harvest|promote` guarda candidatos como datos
en `design-library/stitch/<giro>/<id>/` (bandera `status`: collected → harvested → promoted | shelved | rejected), extrae
paleta, escala tipográfica y patrones de sección, y solo promueve al catálogo `extended` lo que pasa las compuertas A2. El HTML y
las imágenes de Stitch nunca se sirven ni se importan (Modelo A descartado).

**Why:** variedad coleccionable sin comprometerse a promover todo; sin tocar `tenant-sites`, Motion, seed, API ni plantillas
existentes. Hallazgos que fijaron el diseño:

- El MCP de Stitch es una herramienta de Claude, no algo que el CLI pueda llamar: `design gen` prepara DESIGN.md + prompt + plan y la
  skill `/lattiz-design` corre el MCP y registra con `gen --import`.
- `main` ya tenía 5 diferencias en `kit:verify-snapshot` (la-nota-azul): la compuerta compara el conjunto de diferencias antes y
  después, no exige verde.
- Una paleta con ΔE ≥ 15 aún puede ser inservible en un giro: el compilador exige acento a ≥ 30° de los tonos ocupados (dental: 41° y
  212°). `promote` solo avisa; la paleta se usa fijada a mano en un giro con tono libre.
- Una sección nueva aparece en `catalog.manifest.json` y, por el plan de bloques, en `apps/api`/`apps/web`: `--section` es una
  prueba (se restaura todo) salvo `--regenerate-manifest`. Pendiente de producto: que el compilador las inserte sin volverlas
  bloques del editor.
- El harvest es la bitácora auditable: roles → `--lz-*`, contraste por par, distancia por giro, secciones «ya existe / borrador /
  no mapeable» (el borrador vive en harvest.json y `promote` lo escribe), recomendaciones de Motion y necesidades de foto; sin fecha,
  idempotente. `--rigor loose|tight` y un DESIGN.md versionado por dirección (`_design-systems/`, subidos a Stitch).
- Un `--json` de `pnpm` trae líneas de más: parsear solo del primer `{` al último `}`. El aviso de tono de `promote` estuvo
  muerto (try/catch silencioso) hasta que se probó de punta a punta.
- Las compuertas atraparon bugs reales del scaffold (`{{index}}` sin `numbered`, `lz-index` < 14 px, contraste de `muted`/`accent-text`).

**How to apply:** guía en `docs/design-stitch-flow.md`. Nada entra al kit sin `design promote`; `--dry-run` primero. Tests:
`pnpm --filter @lattiz/cli test` (herméticos) y `LATTIZ_DESIGN_E2E=1` para las pruebas contra el kit real. Ver
[[catalog-manifest]], [[snapshot-recorded-inputs]], [[template-palette-library]], [[twin-accent-hue-split]], [[extended-section-variants]].
