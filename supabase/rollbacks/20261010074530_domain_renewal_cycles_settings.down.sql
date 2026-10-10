-- ROLLBACK de 20261010074530_domain_renewal_cycles_settings.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_domain_renewal_cycles_settings`)
-- y aplicarla con `supabase db push`. Se pierden las columnas nuevas del ciclo y las 11 claves de renovación.
-- Los ciclos existentes quedan sin cuota congelada, fechas de gracia ni último aviso al dueño.

ALTER TABLE public.domain_maintenance_cycles
  DROP CONSTRAINT IF EXISTS cycle_amount_matches_parts;

ALTER TABLE public.domain_maintenance_cycles
  DROP COLUMN IF EXISTS base_amount_cents,
  DROP COLUMN IF EXISTS tax_amount_cents,
  DROP COLUMN IF EXISTS plan_at_open,
  DROP COLUMN IF EXISTS opened_at,
  DROP COLUMN IF EXISTS overdue_at,
  DROP COLUMN IF EXISTS site_offline_at,
  DROP COLUMN IF EXISTS late_deadline_at,
  DROP COLUMN IF EXISTS admin_alert_kind,
  DROP COLUMN IF EXISTS admin_alerted_at;

DELETE FROM public.app_settings
WHERE key IN (
  'domain.renewal.enabled',
  'domain.renewal.fee_basic_mxn_cents',
  'domain.renewal.fee_pro_mxn_cents',
  'domain.renewal.tax_rate_bps',
  'domain.renewal.open_days_before',
  'domain.renewal.notice_days_before',
  'domain.renewal.late_days',
  'domain.renewal.late_notice_days_after',
  'domain.renewal.max_registrar_attempts',
  'domain.renewal.balance_alert_days',
  'alerts.admin_email'
);
