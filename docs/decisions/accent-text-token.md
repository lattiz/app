---
name: accent-text-token
description: --lz-color-accent es relleno; accent-text es el acento como texto (lima no pasa AA)
type: gotcha
date: 2026-10-10
commit: 9264805
---

Los temas definen `accent` (rellenos: botones, bandas, marcadores) y `accent-text` (palabras de acento en títulos, hover de enlaces). Con `accentWords: highlight` las palabras de acento van en `accent-text` sobre una banda de `accent` y el contraste AA se valida contra esa banda en vez de contra el fondo.

**Why:** un acento lima (#C6F135) sobre blanco roto da ~1.2:1; usarlo como color de texto rompe AA y el validador lo rechaza con razón. Separar los dos usos permite acentos claros sin perder contraste. La banda es un degradado (16%–88% de la altura) porque el fondo completo de la caja del glifo tapaba la línea de arriba con interlineado < 1.
**How to apply:** en CSS nuevo, `color: var(--lz-color-accent)` es casi siempre un error: usa `--lz-color-accent-text` para texto. Ver [[template-distinctness-gate]].
