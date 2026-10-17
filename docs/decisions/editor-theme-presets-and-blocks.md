---
name: editor-theme-presets-and-blocks
description: Tema escribe tokens --lz-* en :root (no --gjs-t-*); bloques y temas Pro con proIncluded
type: project
date: 2026-10-11
commit: f1416a6
---

El diálogo "Tema" del editor aplica paletas y tipografías reescribiendo los tokens de template-kit en la regla `:root` del proyecto (`editor.Css.getRule(':root').addStyle`) y cambia un `<link data-lz-theme-fonts>` en los componentes del `<head>` del wrapper (GrapesJS 0.22). No usa `globalStyles`/`--gjs-t-*` de Studio. El kit de secciones son `blocks.default` de Studio: definiciones de componente con su CSS (`styles`), clases `lzb-` que leen `--lz-*` con valores de respaldo, y traits para los valores `data-lz-*` editables. Básico ve 4 paletas; Pro, además 8 paletas con variante oscura y 6 tipografías, según `templateAccess.proIncluded` (la misma política de plantillas Pro, calculada en la API). El plan de cada bloque ya no es una lista a mano: ver [[editor-plan-catalog]].

**Why:** las plantillas del kit ya leen todo de `--lz-*` y su validador prohíbe `.gjs-t-*`/`globalStyles`; con `--gjs-t-*` habría que reescribir cada plantilla. Studio solo lee `blocks` al montar, por eso el editor espera a `/tenants/me` antes de crearse. Probado en el editor real: el bloque soltado sigue la paleta y la fuente se carga en el canvas.
**How to apply:** paleta nueva → `theme-presets.ts`, revisar contraste AA (texto, muted, accent-text y on-accent). Bloque nuevo a mano → `features/editor/blocks/{basic,pro}-blocks.ts` con `kitVariant` o `editorOnly`, sin `h1`, breakpoints 992/480, `prefers-reduced-motion` si se mueve; del kit → [[editor-kit-blocks]]. Ver [[template-tiers-model]], [[lattiz-motion-runtime]].
