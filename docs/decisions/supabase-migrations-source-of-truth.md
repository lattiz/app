---
name: supabase-migrations-source-of-truth
description: El esquema vive solo en supabase/migrations (Supabase CLI); cómo aplicar cambios
type: project
date: 2026-10-03
---

Desde 2026-10-03 el historial del esquema es `supabase/migrations/` (se bajaron las 18 migraciones aplicadas por MCP, se integró `profiles` de Drizzle y se capturó el drift del dashboard: RLS de profiles y bucket `template-assets`). Drizzle es solo el query builder; sus migraciones se eliminaron. El repo está enlazado al proyecto `qozzexpfsjdrqlvvrvqs`.

Drift conocido que queda: `public.rls_auto_enable()` lo crea el ajuste de RLS automático de la plataforma Supabase y no está en migraciones a propósito (el advisor lo marca como SECURITY DEFINER ejecutable por anon).

**Why:** antes solo la BD remota tenía el historial; un entorno nuevo no se podía reconstruir desde el repo.
**How to apply:** cambio de esquema = `supabase migration new` → `supabase db reset --local` → `supabase db push`. Escribir en la BD remota requiere OK explícito del usuario. Ver [[openprovider-registrar-migration]].
