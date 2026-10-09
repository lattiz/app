---
name: free-preview-trial
description: Prueba gratuita sin suscripción: preview temporal, qué se bloquea y dónde vive cada regla
type: project
date: 2026-10-09
---

Un tenant `plan='none'` (nunca pagó) puede elegir template, usar el editor y publicar a su preview `{slug}.lattiz.app`. La ventana empieza en su PRIMERA publicación (`tenants.preview_started_at`, inmutable, una sola vez) y dura `preview.trial_days` (3 al aplicarse; ver [[app-settings-config]]). Vencida: puede seguir editando y guardando el borrador, pero no publicar, subir assets ni cambiar template; su URL muestra una página de Lattiz con CTA a planes. Dominio propio, slug personalizado y analytics siguen siendo solo de pago. Cancelados/morosos (plan basico/pro sin suscripción vigente) NO reciben la prueba.

- Una sola regla: `computePreviewCapability` (`apps/api/src/common/billing/preview-capability.ts`); la usan `PublishAllowedGuard`, `GET /tenants/me` (`previewState`, `canPublish`, `previewExpiresAt`) y el sellado del reloj. La web solo lee esos campos, nunca recalcula fechas.
- El sitio público lo decide `get_public_tenant_site` (`serving_state` serving/expired/unavailable, `is_paid`). tenant-sites NO debe pasar `p_trial_days`: la ventana sale de la tabla.
- Anti-abuso solo para no pagados: HTML sanitizado al publicar (sanitize-html, puerto `HtmlSanitizerPort`), CSP sin JS ni formularios + banner + noindex en tenant-sites, correo verificado, rate limit, assets solo imágenes por magic bytes con cuota por tenant. Kill switch: `tenants.status='inactive'`.
- Un job manda un único correo `preview_ending` (clave idempotente en el outbox).

**Why:** que el usuario pruebe el producto antes de pagar sin abrir hosting gratis ilimitado; el pago filtraba el abuso y ahora lo hacen estas capas. Se descartó borrar cuentas o contenido: solo se baja el sitio.
**How to apply:** para apagar la feature, `preview.enabled=false` en `app_settings` (la API vuelve a la regla anterior y el SQL cierra la ventana). Rollback de esquema en `supabase/rollbacks/` (no se aplica solo). Tras pagar, el HTML guardado de la prueba está sanitizado: si un template usara scripts, hay que republicar.
