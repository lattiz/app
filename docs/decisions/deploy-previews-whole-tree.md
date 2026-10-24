---
name: deploy-previews-whole-tree
description: el deploy de previews reemplaza todo el sitio desde la rama actual; guarda contra carpetas faltantes
type: gotcha
date: 2026-10-23
commit: HEAD
---

`lattiz deploy` (y `ship`/`publish`, que lo llaman) sube `apps/template-previews/public` **completo** y reemplaza el sitio de `templates.lattiz.app`. Si se hace desde una rama que no tiene las carpetas que otra rama ya publicó (por ejemplo una rama creada antes de que `main` sumara las renovaciones), esas plantillas siguen `is_active=true` en `templates` con su `preview_url`, pero la página da 404. Pasó el 2026-10-23: dos `ship` desde una rama con 58 carpetas dejaron sin página a Alhelí, Abeto v3, Cauce, Casa Confeti, Clavería Verde, Nogal y más.

**Why:** la tabla `templates` no guarda el contenido del preview; solo lo sirve Vercel desde el árbol desplegado. Nada comparaba una cosa con la otra.
**How to apply:** el deploy ahora consulta Supabase y aborta si hay plantillas activas sin carpeta en el árbol (`--allow-missing` para saltarlo a propósito, p. ej. si se retiraron). Antes de un `ship`, `git merge origin/main` en la rama. Para diagnosticar un 404: `select id, is_active from templates` y comparar con `ls apps/template-previews/public`. Ver [[lattiz-template-cli]].
