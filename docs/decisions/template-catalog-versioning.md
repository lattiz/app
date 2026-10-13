---
name: template-catalog-versioning
description: Extender sin mutar; catálogo legacy/extended, lock por spec y snapshot dorado
type: project
date: 2026-10-12
commit: a29eedd
---

El kit crece sin cambiar lo existente. `brand.catalog` en el spec: sin el campo es `legacy` y el compilador solo elige de los pools de antes (paletas y pares del giro, las 31 variantes de `LEGACY_VARIANTS` en `src/spec/catalog.ts`); `extended` suma `palettes/`, `font-pairs/` y toda carpeta nueva de `sections/`. Nombrar un id nuevo funciona en cualquier catálogo. `lattiz build` lee y escribe `specs/<stem>.lock.json` (paleta, par, forma, arquetipo, variante por rol y tier): lo que el spec no fija sale del lock y un choque falla en vez de moverse. `golden/snapshot.json` guarda el hash de cada salida de las 26 plantillas y de lo que planea cada spec (`specs/`, `fixtures/spec/`, `skill-eval`).

**Why:** el compilador rota pools con una semilla del id; agregar una paleta, un par o una carpeta de variante cambiaba la elección de specs ya publicados al recompilar. Probado: con una variante de portada extra el snapshot sigue idéntico; con seis paletas extra un spec `extended` sin lock cambia y con lock no.
**How to apply:** `pnpm --filter @lattiz/template-kit kit:verify-snapshot` después de cada cambio al kit; regenerar (`kit:snapshot`) solo con una razón escrita en el commit. Variantes, paletas y pares nuevos van en carpetas/archivos nuevos, nunca editando los legacy. `lattiz spec lock <stem> --refresh` re-elige a propósito. Ver [[template-spec-compiler]], [[template-distinctness-gate]].
