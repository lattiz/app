---
name: grapesjs-mobile-layout-plugin
description: Editor móvil con layoutSidebarButtons + cast de tipos; también cambia el layout de escritorio
type: project
date: 2026-10-07
commit: 5898483
---

`apps/web/src/features/editor/SiteEditor.tsx` (`buildOptions`) añade `layoutSidebarButtons` de `@grapesjs/studio-sdk-plugins` al array de plugins, con cast `as unknown as StudioPlugins`.

**Why:** el layout por defecto del SDK (3 columnas fijas) es inutilizable por debajo de ~1000px; el plugin trae layouts responsivos para tablet y móvil con barra inferior. Los tipos del plugin (1.0.39) divergen de studio-sdk 1.1.1 aunque el runtime funciona. Efecto colateral aceptado: el escritorio también pasa a barra lateral de botones.
**How to apply:** no quitar el cast sin subir ambos paquetes a versiones compatibles. Ver [[grapesjs-sdk-pin-1-1-1]].
