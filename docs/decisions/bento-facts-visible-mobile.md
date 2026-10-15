---
name: bento-facts-visible-mobile
description: Hero bento muestra sus datos también en tablet y móvil; display:none los marcaba en nojs
type: gotcha
date: 2026-10-14
commit: 00383d5
---

Los datos de la portada `bento` ya no se ocultan con `display:none` por debajo de 993 px. En tablet y móvil son una fila de celdas bajo el titular. Con JS apagado, `check` pasaba a FAIL en `nojs`: los `<li>`/`<p>` de un padre oculto quedan con rectángulo 0×0 y `display` distinto de `none`, así que el check los cuenta como ocultos.

Para que el hero móvil siga dentro del pliegue (`fit`): titular ×0.9, texto 15 px, CTAs en una fila, foto 4:1 y padding de celda reducido a ≤480 px; el mínimo del valor de dato baja a 22 px.

**Why:** ocultar contenido para que pase una compuerta es trampa; el contenido debe verse sin JS. Descartado: relajar `nojs` en `check.ts` y ocultar con clip o absolute (solo engaña al check).
**How to apply:** no pongas `display:none` en contenido de una variante para ahorrar altura. Si una variante no cabe en móvil, compacta tipografía, padding o foto por CSS. Presupuesto CSS de la Pro: 38.0 KiB, actual 38.1 KiB (WARN, sin subir el número). Ver [[viewport-fit-system]].
