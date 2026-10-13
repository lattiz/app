---
name: extended-section-variants
description: contrato de las variantes extended y la compuerta kit probe; lo legacy queda WARN
type: project
date: 2026-10-12
commit: 9c5a022
---

Una variante nueva es una carpeta en `sections/` (fuera de `LEGACY_VARIANTS` = `extended`, ningún spec legacy la ve) con `meta.ts › tiers`, `intent`, `archetypes` y, si lee claves que ningún giro escribe, `sample`. Reusa las claves de sus hermanas (las portadas leen las de `hero/split`), texto ≥ 14 px (sin `lz-index`/`lz-chip`/`lz-sticker`/`lz-label`), táctiles ≥ 44 px, sin iframe ni pastillas sobre fotos; las claves nuevas van con límite en `COPY_LIMITS`. Se aprueba con `pnpm lattiz kit probe <slot/variante>`: página completa con el compilador real, 3 temas, copy demo/largo/corto, `kit:validate` + overflow, texto, táctiles, axe y encaje/pliegue en 7 tamaños; solo FAIL en la sección probada. `test/extended-sections.test.ts` hace cumplir el contrato estático.

**Why:** la galería (WP2) solo muestra; hacía falta una compuerta que midiera lo que mide `lattiz check` pero por variante y sin plantilla en `templates/`. Un navbar se prueba sobre `hero/poster` (su altura es exactamente el encaje) porque con `hero/split` el fallo de copy largo es preexistente y tapaba si `--lz-header-h` estaba bien sumado. En páginas completas (`kit archetypes`) lo que ya hace una variante legacy (12 px, enlaces de 32 px) queda WARN, como en `check`: no se corrige lo publicado (extender, nunca mutar).
**How to apply:** toda variante nueva pasa `kit probe` con 0 FAIL en demo, largo y corto antes del commit, y `kit:verify-snapshot` sigue idéntico. Ver [[template-catalog-versioning]], [[template-style-tokens]], [[page-archetypes-data]].
