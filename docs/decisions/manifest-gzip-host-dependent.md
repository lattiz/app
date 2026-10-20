---
name: manifest-gzip-host-dependent
description: el gzip del manifiesto cambia según el zlib de la máquina; queda fuera del hash y del --check
type: gotcha
date: 2026-10-20
commit: 85faad4
---

`kit:manifest` mide el CSS de cada primitivo con `gzipSync(level 9)`, y ese tamaño depende del zlib
con el que se compiló Node en cada máquina (mismo `lz-btn/base.css`: 577 B en una, 578 B en otra,
con Node 22 o 24 por igual). Como los números entraban al `contentHash`, cada regeneración en otra
máquina movía el hash (y con él `manifestHash` en la API y en web) y `kit:manifest --check`, que
corre en `pnpm lint`, fallaba en la máquina que no hizo el último commit.

**Why:** el gzip del manifiesto es solo informativo: las compuertas de bytes (`budgets.json`,
`SECTION_CSS_GZIP_MAX` de `design promote`) miden en vivo. Se descartó fijar una versión de zlib
o añadir una librería de deflate en JS: más dependencia para un dato que nadie lee.
**How to apply:** `contentHash` se calcula sin las llaves `gzip`, y `--check` compara los archivos
con los números de gzip normalizados. Un diff en `catalog.manifest.json` que solo cambia `"gzip"`
es ruido de la máquina: se puede commitear o descartar. No uses esos números como compuerta.
Parecido a [[placeholder-bytes-host-dependent]].
