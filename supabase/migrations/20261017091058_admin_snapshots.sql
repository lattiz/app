-- Point-in-time snapshots for the admin panel. The API connects as the owner.
-- anon and authenticated get no access; the admin schema is not exposed.

CREATE TABLE admin.storage_usage (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  assets_bytes bigint NOT NULL DEFAULT 0,
  assets_objects integer NOT NULL DEFAULT 0,
  branding_bytes bigint NOT NULL DEFAULT 0,
  branding_objects integer NOT NULL DEFAULT 0,
  measured_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN admin.storage_usage.assets_bytes IS 'Bytes in tenant-assets/<tenant_id>/.';
COMMENT ON COLUMN admin.storage_usage.branding_bytes IS 'Bytes in tenant-branding/<tenant_id>/.';

CREATE TABLE admin.kpi_daily (
  day date PRIMARY KEY,
  mrr_cents bigint,
  currency text,
  paying_tenants integer NOT NULL DEFAULT 0,
  trials_active integer NOT NULL DEFAULT 0,
  signups integer NOT NULL DEFAULT 0,
  new_paying integer NOT NULL DEFAULT 0,
  cancellations integer NOT NULL DEFAULT 0,
  published_sites integer NOT NULL DEFAULT 0,
  captured_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE admin.kpi_daily IS 'El historial empieza el día que corre el cron; no se puede reconstruir.';
COMMENT ON COLUMN admin.kpi_daily.day IS 'Calendar day in America/Mexico_City.';

ALTER TABLE admin.storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.kpi_daily ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE admin.storage_usage FROM anon, authenticated;
REVOKE ALL ON TABLE admin.kpi_daily FROM anon, authenticated;

-- Read models filter sites by template and pick the latest subscription per tenant.
CREATE INDEX IF NOT EXISTS site_schemas_template_id_idx
  ON public.site_schemas (template_id);

CREATE INDEX IF NOT EXISTS subscriptions_status_idx
  ON public.subscriptions (status);

CREATE INDEX IF NOT EXISTS subscriptions_tenant_created_at_idx
  ON public.subscriptions (tenant_id, created_at DESC);
