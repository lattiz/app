---
name: navbar-mobile-menu-target
description: menú móvil sin JS con #menu + :target; Básico tarjeta, Pro pantalla completa
type: project
date: 2026-10-12
commit: a8d7865
---

Los dos navbars del kit llevan menú móvil (≤ 992 px) sin JavaScript: el botón enlaza a `#menu`, `.lz-menu:target` muestra el panel y tocar un link de sección cambia el hash y lo cierra; el ✕ enlaza a `#menu-cerrado`. Estilos en `core.css` bajo `.lz-page`; el compilador marca `.lz-page--pro|--basic` y con eso Básico es una tarjeta flotante y Pro una pantalla completa. En escritorio, Lattiz Motion ya no marca el link de la sección activa (se encendía tarde o al final de la sección).

**Why:** el kit prohíbe JS en las plantillas y la Básica no lleva runtime; un checkbox no se cierra al tocar un link y `popover` tampoco. Tres hallazgos: en móvil el header no puede llevar `backdrop-filter` ni `translate` (serían el bloque contenedor del panel `fixed`); el bloqueo de scroll va en `body`, porque `overflow` en `html` corta la propagación del `overflow-x` de `body` al viewport y el header sticky se va con el scroll; y `page.click()` de Playwright desplaza la página al hacer clic en un header sticky, así que las pruebas usan `element.click()`.
**How to apply:** un navbar nuevo repite el marcado (`nav#menu.lz-menu`, `.lz-menu__list/__link/__cta`, los dos `.lz-menu-toggle` y `#menu-cerrado`); no metas `--lz-shadow` en una lista de sombras (puede ser `none`). En el editor el menú abierto no se ve; los links se editan en escritorio. Ver [[viewport-fit-system]], [[lattiz-motion-runtime]].
