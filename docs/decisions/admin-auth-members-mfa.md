---
name: admin-auth-members-mfa
description: AdminGuard = miembro activo en admin.members + aal2 + rol; sin @AdminRoles solo owner; auditoría de toda mutación
type: project
date: 2026-10-17
commit: 8d3858c
---

El admin usa Supabase Auth del mismo proyecto, sin cuentas propias. `AdminGuard` corre después de `SupabaseJwtGuard` y comprueba, en este orden:
1. Que el usuario sea un miembro activo en `admin.members`, con caché de 60 s que también guarda los negativos. Si no, `ADMIN_ACCESS_DENIED`.
2. Que la sesión tenga el claim `aal` = `aal2` (MFA TOTP completado). Si no, `ADMIN_MFA_REQUIRED`.
3. Que su rol esté en `@AdminRoles(...)`. Si no, `ADMIN_ROLE_FORBIDDEN`. Una ruta sin decorador es solo para `owner`, para fallar cerrado.

`AdminAuditInterceptor` escribe en `admin.audit_log` (solo inserción, por trigger) cada petición que modifica algo, también las fallidas (`<acción>.failed`), sin perder el error original. Los miembros se dan de alta o se revocan con `pnpm --filter @lattiz/api admin:grant -- grant|revoke|list`. El alta marca el tenant del miembro como interno (`admin.tenant_flags.is_internal`), para sacarlo de los KPI. TOTP está activo en `supabase/config.toml`; en el proyecto remoto se confirma en el dashboard.

**Why:**
- La membresía se comprueba antes que el MFA para no revelarle a un no miembro que la ruta pide `aal2`.
- La consulta a la BD con caché corta deja que revocar tenga efecto en ≤ 60 s. Un claim en el JWT tardaría hasta que expire el token.
- Habilitar TOTP no cambia el login de los clientes, porque `SupabaseJwtGuard` no mira `aal`.
- Los ids de usuario nunca van en migraciones; por eso existe el script.

**How to apply:**
- Rutas de solo lectura para el dashboard: `@AdminRoles('owner','operator','viewer')`.
- Destructivas (cancelar en Stripe, borrar tenants, miembros): solo `owner`.
- Usa `@AdminAudit(acción, { targetType, targetParam })` y, para guardar el antes y el después, `request.adminAudit`.
- Ver [[admin-architecture]].
