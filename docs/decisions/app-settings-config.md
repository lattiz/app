---
name: app-settings-config
description: Configuración de negocio en la tabla app_settings (BD > env > default); qué va y qué no
type: project
date: 2026-10-09
---

La política de negocio vive en `public.app_settings` (clave, valor jsonb, historial en `app_settings_audit`; RLS cerrado, solo la API la lee). `SettingsService` (`apps/api/src/common/settings/`) carga la tabla en memoria y refresca cada `SETTINGS_REFRESH_SECONDS` (60). Precedencia: valor de BD > variable de entorno > default de código. Un valor mal tipado se ignora con un aviso y no tumba la API; si la BD falla se conserva el último snapshot. `PreviewConfig` expone `preview.*` sobre este servicio. El SQL (`get_public_tenant_site`) lee `preview.enabled` y `preview.trial_days` con helpers tolerantes `app_setting_int/bool`.

- Sembradas: todas las `preview.*` (`trial_days`=3), `domain.max_cost_usd_cents`=2200 (compra), `domain.basic_renewal_max_cost_usd_cents`=2367, `domain.pro_renewal_max_cost_usd_cents`=4200, `domains.mock_purchases`=false, `email.sending_enabled`=true, `email.max_per_run`=20, `dns.reconcile.*` (enabled, grace 120, max_deletes 5, keep_zones ["lattiz.app"]). Cambiar un valor = UPDATE en la tabla (queda auditado), sin redeploy.
- Leen la tabla en caliente: `preview.*`, correo (cada tick), barrido DNS (cada ejecución) y topes de dominio (getters vivos; si una edición deja BASIC > PRO se conserva el último trío válido y se avisa). Se fija al arrancar: `domains.mock_purchases` (elige adaptador; requiere reinicio).
- Los topes de dominio no tienen default de código: la API no arranca si faltan en BD y en env, o si son inválidos (regla de `parseDomainPriceCaps`).
- NO van en la tabla: secretos (Stripe, Openprovider, Cloudflare, Vercel, Resend, service role, `REVALIDATION_SECRET`, `CRON_SECRET`), arranque (`DATABASE_URL`, `PORT`, `CORS_ORIGIN`) ni cableado de infraestructura como `EMAIL_PROVIDER`, `STORAGE_PROVIDER`, `DNS_PROVIDER` (eligen el adaptador al arrancar).

**Why:** cambiar umbrales de negocio sin redeploy, con historial, y poder construir un /admin después sobre la misma tabla. Se sembraron valores explícitos solo donde se conocía el valor de producción para no cambiarlo en silencio.
**How to apply:** nuevo umbral de negocio = nueva clave en `settings.registry.ts` (con env de respaldo y default) y fila sembrada por migración de datos. No editar la tabla desde el dashboard sin dejar `updated_by`. Relacionada: [[free-preview-trial]], [[supabase-migrations-source-of-truth]].
