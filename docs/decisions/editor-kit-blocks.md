---
name: editor-kit-blocks
description: bloques del editor generados del kit; solo el CSS usado; respaldo de tokens en :where(html)
type: project
date: 2026-10-17
commit: c22084e
---

`packages/template-kit/src/cli/editor-blocks.ts` (lo corre `kit:manifest`) renderiza las portadas bento/rail/overlap/stack, `cta/band` y los 7 primitivos a `apps/web/src/features/editor/blocks/kit-blocks.generated.ts`: markup y clases del kit con `data-lz-slot`/`data-lz-variant`, copy neutro es-MX, `h1` → `h2`, sin `id`, contacto como `{{lz:*}}`, y como `styles` solo el CSS que usa (reglas de `core.css` cuyas clases están todas en el markup, primitivos usados, CSS de la variante) más un respaldo de tokens en `:where(html)`. Los 3 bloques Pro sin variante (`stacked-cards`, `before-after`, `open-now`) quedan `editorOnly`.

**Why:** Studio agrega el `styles` de un componente con `avoidUpdateStyle`: una regla que el proyecto ya tiene no se reescribe, así que insertar un bloque no cambia lo guardado. El respaldo primero fue `:root{…}`, pero el fixture legacy `oxido` ya tiene `:root` (con `--gjs-t-*`) y se saltaba entero: el bloque salía sin título ni botones. `:where(html)` no tiene especificidad y funciona por token: llena solo lo que falta y el `:root` de una plantilla del kit gana siempre. Agregar al kit las 3 variantes faltantes era más grande que marcarlas solo editor. Verificado en un arnés local con proyectos del kit y el legacy, sin API.
**How to apply:** bloque nuevo del kit → entrada en `SECTIONS`/`PIECES` de `editor-blocks.ts`, `kit:manifest`, y `kit-blocks.test.ts`. Ver [[editor-plan-catalog]], [[template-primitives]].
