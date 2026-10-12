---
name: lattiz-template-skill
description: skill /lattiz-template sobre un contrato headless del CLI; nunca escribe en remoto
type: project
date: 2026-10-12
commit: 45944d1
---

`.claude/skills/lattiz-template/` (SKILL.md + references) arma el par Básico + Pro desde un pedido en lenguaje natural: `giro show` → `spec init` → editar solo el spec → `spec validate --strict` → `build` → `check --json` en serie (máx. 4 vueltas, arregla con `findings[].specHint`; el WARN `fold` cuenta como bloqueante) → `review` (máx. 2 rondas con rúbrica) → entrega con el comando `ship` sin correrlo. El CLI expone todo lo que la skill necesita para no leer código: `giro list|show` (variantes por tier, paletas/tipografías `free`, `otherFontPairs`, `usedAccentHues`/`freeHueRanges`, claves de copy con límite), `--strict` (copy-lint), `findings[]`, `review`, `next[]`. Sin TTY, seed/deploy/publish/ship exigen `--yes` **y** `--confirm-remote`.

**Why:** el fundador necesita muchas plantillas rápido sin abrir el kit; el modelo solo es confiable si los límites (longitud, unicidad, pliegue, datos ficticios, nada remoto) los aplica el CLI y no su criterio. `allowed-tools` solo pre-aprueba (no restringe), por eso la segunda llave está en el CLI. Se descartó que la skill edite archivos generados o secciones (rompe el modelo spec → salida). La evaluación (taquería, despacho, veterinaria) encontró 7 huecos que se arreglaron en el CLI; el pedido repetido bajó de ~11 a ~3.5 min con 0 rondas.
**How to apply:** cambios de flags o formas JSON → actualizar `references/commands.md` en el mismo commit. Los specs de evaluación viven en `fixtures/spec/skill-eval/` para no gastar paletas del giro (~2 pares curados por giro; luego paleta propia). Ver [[template-spec-compiler]], [[kit-contact-site-tokens]], [[viewport-fit-system]].
