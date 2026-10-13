---
name: template-palette-library
description: Paletas extended desde semillas (kit:palettes), AA por construcción y ΔE00 ≥ 15 por giro
type: project
date: 2026-10-12
commit: f218ce5
---

Las paletas nuevas se escriben como semillas en `packages/template-kit/palettes/seeds.ts` (fondo, texto, acento, ánimo, tipo light/dark/tinted, afinidad por giro); `pnpm --filter @lattiz/template-kit kit:palettes --write` deriva el resto de los tokens con AA, rechaza las que no pasen `kit:validate`, mide la distancia (ΔE00 del fondo + ΔE00 del acento) y congela hex fijos en `palettes/library.ts`. 39 paletas, 9 con acento neutro. En el catálogo `extended` una paleta solo está libre si además de su tono (≥ 30°) queda a ≥ 15 de toda paleta ya usada en el giro.

**Why:** la regla de tono no cuenta los acentos casi grises: sin la distancia, el compilador reusaba una paleta neutra seis veces en un giro y la capacidad salía en 29 (falso). Los nombres «mexicanos» obvios (talavera, jamaica, nopal, lavanda) ya existían en los giros; la primera versión tenía 11 casi duplicados.
**How to apply:** nueva paleta = semilla nueva con id nuevo (`pal-…`), `kit:palettes --write` y revisar `kit gallery --palettes`; nunca editar `library.ts` ni recolorear un id publicado. Medir capacidad con `lattiz kit capacity --catalog extended`. Ver [[template-catalog-versioning]], [[template-distinctness-gate]].
