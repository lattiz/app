---
name: template-rhythm-tokens
description: Ritmo global por tema (rhythm) con defaults = px originales; sin overrides.css
type: project
date: 2026-10-11
commit: 972320f
---

Los temas aceptan `rhythm` opcional (`gutter*`, `space`, `textScale`, `titleHero*`, `titleSection*`, `titleSub`, `sectionPad`) que `theme.ts` vuelca a `:root` como `--lz-*`. Las secciones multiplican sus px: `calc(20px * var(--lz-space))` en gaps/márgenes/paddings y `calc(14px * var(--lz-text-scale))` en texto ≤ 20 px; los títulos leen `--lz-title-*`. Los defaults son exactamente los literales anteriores: las 6 plantillas compilan pixel-idénticas (24 capturas comparadas a 1280/992/768/390). Hoy solo `core.css` y las 11 variantes de `barberia-norte-v1` están tokenizadas.

**Why:** el fundador necesita pocos controles para el ritmo global sin romper otras plantillas. Una escala de gaps (`--lz-gap-sm/md…`) obligaba a redondear valores (cambios visuales en todas las plantillas que comparten la sección); un multiplicador conserva cada valor. No hay `overrides.css` por plantilla: el tema ya es único por plantilla dentro del rubro y el kit pide variantes nuevas para cambios locales. Norte usa títulos fluidos monótonos porque los defaults saltaban de 58 a 40 px entre 480 y 481 px.

**How to apply:** al tocar o crear una variante, escribe espaciados con `var(--lz-space)` y texto pequeño con `var(--lz-text-scale)`; antes/después compara capturas (todas idénticas si no cambias defaults). Guía: `docs/template-workflow.md` §6. Ver [[template-distinctness-gate]].
