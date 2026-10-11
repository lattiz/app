-- Annual renewal of a Lattiz-managed domain: freeze the fee when a cycle opens,
-- and keep the schedule in app_settings (database > env > code default).

ALTER TABLE public.domain_maintenance_cycles
  ADD COLUMN IF NOT EXISTS base_amount_cents INTEGER CHECK (base_amount_cents > 0),
  ADD COLUMN IF NOT EXISTS tax_amount_cents INTEGER CHECK (tax_amount_cents >= 0),
  ADD COLUMN IF NOT EXISTS plan_at_open TEXT,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS overdue_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS site_offline_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS late_deadline_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_alert_kind TEXT,
  ADD COLUMN IF NOT EXISTS admin_alerted_at TIMESTAMPTZ;

-- CHECK accepts UNKNOWN, so a NULL amount_cents must fail explicitly when both parts are set.
ALTER TABLE public.domain_maintenance_cycles
  DROP CONSTRAINT IF EXISTS cycle_amount_matches_parts;

ALTER TABLE public.domain_maintenance_cycles
  ADD CONSTRAINT cycle_amount_matches_parts
  CHECK (
    base_amount_cents IS NULL
    OR tax_amount_cents IS NULL
    OR (
      amount_cents IS NOT NULL
      AND amount_cents = base_amount_cents + tax_amount_cents
    )
  );

INSERT INTO public.app_settings (key, value, description, updated_by)
VALUES
  ('domain.renewal.enabled', 'true'::jsonb,
   'Enciende la renovación anual de dominios gestionados por Lattiz.', 'migration'),
  ('domain.renewal.fee_basic_mxn_cents', '59900'::jsonb,
   'Cuota anual sin IVA del plan básico (y de cualquier plan que no sea pro), en centavos de MXN. 59900 = 599 MXN.', 'migration'),
  ('domain.renewal.fee_pro_mxn_cents', '59900'::jsonb,
   'Cuota anual sin IVA del plan pro, en centavos de MXN. 59900 = 599 MXN.', 'migration'),
  ('domain.renewal.tax_rate_bps', '1600'::jsonb,
   'IVA en puntos base. 1600 = 16 %.', 'migration'),
  ('domain.renewal.open_days_before', '28'::jsonb,
   'Días antes del vencimiento en que se abre el enlace de pago. Openprovider solo garantiza renovar dentro de las 4 semanas previas.', 'migration'),
  ('domain.renewal.notice_days_before', '[28,14,7,3,1,0]'::jsonb,
   'Días antes del vencimiento en que se avisa por correo. 0 es el día del vencimiento.', 'migration'),
  ('domain.renewal.late_days', '15'::jsonb,
   'Días de gracia después del vencimiento antes de liberar el dominio.', 'migration'),
  ('domain.renewal.late_notice_days_after', '[7]'::jsonb,
   'Días después del vencimiento en que se avisa el pago tardío. Lista vacía = sin esos avisos.', 'migration'),
  ('domain.renewal.max_registrar_attempts', '5'::jsonb,
   'Intentos máximos de renovar el dominio en el registrador tras el pago.', 'migration'),
  ('domain.renewal.balance_alert_days', '30'::jsonb,
   'Días de anticipación para avisar si el saldo del registrador no cubre las renovaciones.', 'migration'),
  ('alerts.admin_email', '"avisos@lattiz.app"'::jsonb,
   'Correo del dueño de Lattiz para avisos operativos. Vacío no envía.', 'migration')
ON CONFLICT (key) DO NOTHING;
