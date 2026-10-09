---
name: editor-text-edit-touch-emulation
description: La emulación táctil de Chrome impide editar texto (no es bug); estilos y acciones del RTE
type: gotcha
date: 2026-10-08
commit: 5898483
---

Con la emulación táctil del DevTools no se puede editar texto en el canvas (no hay doble clic); en una pestaña reducida o en un dispositivo real sí. No es un bug de la app ni del template (no hay `editable: false`). Un botón de lápiz propio (`onActive`, `focus()`, `dblclick` sintético) se probó y se descartó sin verificar su efecto.

RTE: en el `load` de `SiteEditor.tsx` se quitan las acciones `link` y `wrap` (`editor.RichTextEditor.remove`); `grapesjs-sdk.css` estiliza `.gjs-rte-toolbar` en azul `hsl(210 75% 50%)`, botones de 36px e iconos de 18px, sin radius ni sombra (no gustaron las esquinas redondeadas).

**Why:** `wrap` no tiene uso para usuarios finales y los enlaces ya existen como componente Link.
**How to apply:** antes de depurar "no deja editar texto", probar en pestaña reducida o dispositivo real.
