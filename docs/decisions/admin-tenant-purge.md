---
name: admin-tenant-purge
description: borrado completo de un tenant desde el admin: qué se borra en cada proveedor y qué se conserva
type: project
date: 2026-10-17
commit: 11822de
---

El admin (solo `owner`) borra un tenant con un trabajo por pasos en `admin.tenant_deletions` (`apps/api/src/modules/admin/deletions/`). Pasos, en este orden:

1. `offline`: `tenants.status = 'inactive'`.
2. `stripe`: `cancelSubscriptionsForUser`. Si falla, el trabajo se detiene **sin haber borrado nada**.
3. `domain`: `releaseDomain` (Vercel y zona DNS).
4. `registrar`: Openprovider **se deja expirar**. Renovación automática encendida o ilegible → acción manual.
5. `analytics`: GA4 a la papelera (35 días). Las propiedades mock se omiten si el gateway es real.
6. `storage`: `removePrefix` de `tenant-assets/<uuid>/` y `tenant-branding/<uuid>/`. La guarda rechaza cualquier otro prefijo antes de tocar R2.
7. `emails`: los pendientes se cancelan y se encola `account_deleted` si se pidió.
8. `account`: perfil y usuario de Auth. Las filas del tenant caen en cascada.
9. `verify`: se comprueba cada proveedor.

Cualquier paso fallido detiene el trabajo. Reintentar retoma desde ahí, sin repetir los pasos hechos. Estados finales: `completed`, `completed_manual` o `failed`.

**Se conserva a propósito:** el customer, las facturas y los cobros en Stripe; el dominio registrado hasta que vence; los correos ya enviados; la auditoría; y la fila del trabajo, que no tiene FK y lleva el email enmascarado. `notify_email` se borra al terminar.

**Why:** `DELETE /me` no borraba R2, GA4 ni los correos pendientes, y no da trazabilidad. Borrar el dominio en el registrador o el customer en Stripe es irreversible y no aporta nada, porque el dominio expira solo y Stripe necesita el customer para el historial fiscal. `DELETE /me` no cambia.
**How to apply:**
- Un miembro activo de `admin.members` no se puede borrar: primero se revoca.
- Un trabajo `pending` sin reclamar más de 2 min o `running` sin avance más de 10 min se puede reintentar.
- Un proveedor nuevo con datos del tenant se añade como paso, con su verificación en `verify`.
- Ver [[admin-architecture]], [[domain-renewal-fee]] y [[stripe-idempotency-key-per-call]].
