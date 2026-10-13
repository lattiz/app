---
name: placeholder-bytes-host-dependent
description: lattiz build reescribe JPEG de placeholder en otra máquina; restaurar los del repo
type: gotcha
date: 2026-10-12
commit: a29eedd
---

Un `lattiz build` real regenera los placeholders del spec (`assets/<giro>/<id>/*.jpg` y `CREDITS.json`) y, en una máquina distinta a la que los creó, salen con otros bytes: el SVG del placeholder lleva texto (nombre y medidas) que sharp/librsvg rasteriza con las fuentes del sistema. Pasa igual con `main` sin cambios. Manifiestos, temas, packs, perfiles demo y el lock no cambian.

**Why:** se vio en el contenedor de Claude Code al reconstruir `restaurante-casa-comal`; no es deriva del spec ni del compilador.
**How to apply:** si un build solo cambia JPEG de placeholder y `CREDITS.json`, restaúralos (`git checkout -- packages/template-kit/assets`) en vez de commitearlos. Para comprobar reproducción usa `--dry-run`, `lattiz spec lock` o `kit:verify-snapshot`, que no regeneran imágenes. Ver [[template-catalog-versioning]].
