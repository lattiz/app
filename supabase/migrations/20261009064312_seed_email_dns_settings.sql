-- Operational settings confirmed by the owner. The API reads them from app_settings first and falls back to
-- its environment variables while a row is missing. Production DNS zones were checked before enabling the reconciler.
INSERT INTO public.app_settings (key, value, description, updated_by)
VALUES
  ('email.sending_enabled', 'true'::jsonb,
   'Activa el envío real de correos transaccionales desde el outbox.', 'migration'),
  ('email.max_per_run', '20'::jsonb,
   'Máximo de correos que el cron reclama por ejecución.', 'migration'),
  ('dns.reconcile.enabled', 'true'::jsonb,
   'Activa el barrido que borra zonas de Cloudflare sin fila viva en domains.', 'migration'),
  ('dns.reconcile.grace_minutes', '120'::jsonb,
   'Una zona más joven que esto nunca se borra (protege compras en curso).', 'migration'),
  ('dns.reconcile.max_deletes', '5'::jsonb,
   'Si hay más huérfanas que esto en una corrida, no se borra nada y se registra un error.', 'migration'),
  ('dns.reconcile.keep_zones', '["lattiz.app"]'::jsonb,
   'Zonas que el barrido nunca borra.', 'migration')
ON CONFLICT (key) DO NOTHING;
