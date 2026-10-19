---
name: template-metadata-ownership
description: tras el primer seed, nombre/descr./categoría/orden/miniatura son del admin; el kit manda el resto
type: project
date: 2026-10-17
commit: 3d2a433
---

Reparto de dueños de las columnas de `public.templates`:

- **Admin**, tras el primer seed: `name`, `description`, `category`, `sort_order`, `tags`, `featured`, las miniaturas `templates/<id>/admin-thumb-*`, `is_active` y `retired_at`.
- **Kit**, que escribe el seed siempre: `grapesjs_json`, `tier`, `preview_url` y `kit_meta` (giro, familia, arquetipo, dirección, paleta, par tipográfico, secciones, último check y sha).
- Re-sembrar **no** reactiva una plantilla con `retired_at`, ni con `--overwrite-meta`. El CHECK `retired_at IS NULL OR is_active = false` lo garantiza en la BD.
- `--overwrite-meta` (en `parse-and-seed-template.ts`, `template:seed` y `pnpm lattiz seed|publish`) vuelve a imponer la metadata del kit, incluida la miniatura.

**Why:** antes, re-sembrar pisaba lo editado en el admin y reactivaba retiradas. El tier se queda en el kit porque decide qué variantes puede usar la plantilla y a qué tenants bloquea.
**How to apply:** la lógica vive en `scripts/lib/template-seed-policy.ts`, con tests en `pnpm --filter @lattiz/cli test`. Una columna nueva de `templates` se asigna a uno de los dos dueños en ese archivo. Ver [[template-tiers-model]], [[admin-architecture]] y [[lattiz-template-cli]].
