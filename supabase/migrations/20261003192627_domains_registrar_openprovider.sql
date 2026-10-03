-- Registrar moves from GoDaddy to Openprovider: registrar-neutral column names and source value.

ALTER TABLE public.domains RENAME COLUMN godaddy_registration_id TO registrar_domain_id;

-- GoDaddy's Idempotency-Key is replaced by find-before-create against the registrar account.
ALTER TABLE public.domains DROP COLUMN godaddy_idempotency_key;

ALTER TABLE public.domains DROP CONSTRAINT domains_source_check;
UPDATE public.domains SET source = 'lattiz_managed' WHERE source = 'godaddy_managed';
ALTER TABLE public.domains ALTER COLUMN source SET DEFAULT 'lattiz_managed';
ALTER TABLE public.domains
  ADD CONSTRAINT domains_source_check CHECK (source IN ('lattiz_managed', 'user_provided'));

ALTER TABLE public.domain_maintenance_cycles RENAME COLUMN godaddy_order_id TO registrar_order_id;
