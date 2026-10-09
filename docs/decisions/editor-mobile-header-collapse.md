---
name: editor-mobile-header-collapse
description: Header del editor colapsable en móvil; el canvas necesita un resize tras la transición
type: project
date: 2026-10-08
commit: 5898483
---

En `SiteEditor.tsx` el header va en un wrapper `grid` que alterna `grid-rows-[1fr]`/`[0fr]` según `headerHidden`; al terminar la transición se dispara `window.dispatchEvent(new Event('resize'))`. El scroll se escucha en `document` (fase de captura) y en el iframe del canvas, solo con `max-width: 639px`. Umbrales: ocultar con scroll > 16px y +4px; mostrar al subir 4px o volver arriba. El badge de guardado se renderiza dos veces (escritorio junto a "Regresar", móvil junto al switch).

**Why:** el canvas de GrapesJS no recalcula su alto sin `resize` (dejaba un hueco negro abajo); el badge reserva ancho aunque esté invisible y empujaba "Publicar sitio" a otra fila; el scroll real puede ocurrir en el iframe o en paneles del editor.
**How to apply:** si se toca el header, mantener el `resize` tras la transición y quitar padding y borde al ocultarlo (`max-sm:py-0 max-sm:border-b-0`).
