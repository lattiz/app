---
name: snapshot-recorded-inputs
description: El golden planea cada spec con sus peers y lock grabados; las plantillas nuevas entran con kit:snapshot:add
type: gotcha
date: 2026-10-14
commit: 47ba2b8
---

`kit:verify-snapshot` reproduce las entradas grabadas de cada spec: `peers` (plantillas del giro contra las que se planeó) y `locked` (planeado con `<stem>.lock.json`, como `lattiz build`). Una entrada sin `peers` se planea contra las plantillas del propio golden. Las plantillas y specs nuevos entran con `pnpm --filter @lattiz/template-kit kit:snapshot:add [id|stem…]`, que verifica todo primero y nunca toca entradas existentes.

**Why:** antes planeaba sin lock contra la biblioteca viva. Las 14 plantillas que llegaron a `main` agotaron los tonos legacy de restaurante y el fixture `restaurante-la-lumbre` (legacy, sin lock) dejó de planear: 8 diferencias sin que el kit cambiara (contra las 28 plantillas grabadas reproducía idéntico). Agregar paletas no lo arreglaba (un spec legacy no ve `extended`) y, sin lock, cualquier paleta nueva habría movido los specs `extended`. Descartado: pasar el fixture a `extended` o grabar el error en el golden.
**How to apply:** el snapshot prueba «mismas entradas → mismo plan»; qué cabe hoy en un giro lo dice `lattiz kit capacity`. Procedimiento para plantillas nuevas en `docs/template-kit-catalog.md` («Snapshot dorado: diagnóstico y procedimiento»). `kit:snapshot` (reescribir todo) solo con razón escrita. Ver [[template-catalog-versioning]], [[placeholder-bytes-host-dependent]].
