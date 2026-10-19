---
name: admin-architecture
description: Admin interno = módulo /admin aditivo en apps/api + SPA apps/admin; esquema admin cerrado
type: project
date: 2026-10-17
commit: 8d3858c
---

El panel interno de Lattiz está hecho de tres piezas:
- `apps/admin`: una SPA Vite que copia el stack de `apps/web` y se publica en `admin.lattiz.app` (Vercel).
- Un módulo **aditivo** `apps/api/src/modules/admin` que sirve `/admin/*`.
- El esquema Postgres `admin`, con miembros, auditoría, marcas por tenant y, más adelante, vistas y snapshots.

Ese esquema no se expone por PostgREST: tiene `REVOKE ALL` a `anon` y `authenticated`, y las vistas viven ahí, **nunca en `public`**. Las mutaciones contra Stripe pasan por su API; los webhooks existentes sincronizan la BD y `subscriptions` nunca se escribe directo. El cliente es el mismo `@lattiz/api-client`, generado de un único `openapi.json`.

**Why:**
- Los secretos (Stripe, R2, GA4, service role) siguen solo en la VM, y las reglas de negocio (`computeIsEntitled`, `computePreviewCapability`, acceso por plan) no se duplican.
- Se descartó un BFF en Next.js con acceso directo a la BD, Stripe y R2: segundo lugar con secretos y reglas duplicadas.
- Se descartó un servicio NestJS aparte en la VM: 900 MB de límite y más infraestructura.
- Se descartó RLS o PostgREST con rol admin: expone datos por la API pública.

**How to apply:** toda ruta admin nueva va en `modules/admin/**` con `@UseGuards(SupabaseJwtGuard, AdminGuard)` y `AdminAuditInterceptor`; cambios a módulos existentes solo aditivos. Ver [[admin-auth-members-mfa]], [[app-settings-config]].
