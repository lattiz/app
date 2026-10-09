-- Domain price caps, confirmed by the owner. The API reads them from app_settings first and falls back to
-- DOMAIN_MAX_COST_USD_CENTS / BASIC_DOMAIN_MAX_COST_USD_CENTS / PRO_DOMAIN_MAX_COST_USD_CENTS.
-- The purchase cap moves from the earlier seed (2000) to 2200; the renewal caps are new.
INSERT INTO public.app_settings (key, value, description, updated_by)
VALUES
  ('domain.max_cost_usd_cents', '2200'::jsonb,
   'Tope del precio de compra (primer año) que Lattiz absorbe, en centavos de USD (2200 = USD 22).', 'migration'),
  ('domain.basic_renewal_max_cost_usd_cents', '2367'::jsonb,
   'Tope de renovación que absorbe el plan básico (y cualquier plan que no sea pro), en centavos de USD.', 'migration'),
  ('domain.pro_renewal_max_cost_usd_cents', '4200'::jsonb,
   'Tope de renovación que absorbe el plan pro, en centavos de USD. Debe ser mayor o igual al del básico.', 'migration')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_by = EXCLUDED.updated_by;
