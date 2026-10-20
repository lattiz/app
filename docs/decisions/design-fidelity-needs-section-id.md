---
name: design-fidelity-needs-section-id
description: design fidelity solo mide `#id`; otro ref cae al <footer> sin avisar; revisa vs-*.png
type: gotcha
date: 2026-10-20
commit: 3920736
---

`lattiz design fidelity <id> <ref>` solo apunta a la sección si `<ref>` es un id llano (`#galeria`). Cualquier otro ref (el comentario HTML de una sección sin id, un fragmento de texto) cae a `footer` en `measureFidelity` (`packages/lattiz-cli/src/design/fidelity.ts`) y mide el pie, sin error ni aviso: el veredicto «NUEVA» sale igual. Pasó con el hero y los testimonios de `tienda-caramelo-pop-bandas-01`, que en el HTML de Stitch no tienen id.

Además, el lector de `faq` no encuentra preguntas cuando Stitch las pinta con `div` en vez de `<details>`: el lado del kit sale solo con la cabecera y la métrica no sirve (todo en 1.0, antes y después de reconstruir).

**Why:** el arnés se calibró con diseños cuyas secciones traen id y FAQ en `<details>`. Las reglas de `/lattiz-design` prohíben tocar el CLI desde ese flujo, así que no se corrigió ahí.

**How to apply:** antes de creer una medición, abre `.lattiz/stitch/fidelity/<id>/<ref>/vs-*.png` y confirma que el lado izquierdo es la sección pedida. Para secciones sin id, añade el id en una copia de `source.html`, mide y restaura el original (compara `shasum`). Para el FAQ de `div`, compara a la vista. Un arreglo del CLI (ref por comentario, lector de `div`) queda pendiente. Ver [[stitch-native-reconstruction]], [[stitch-design-source]].
