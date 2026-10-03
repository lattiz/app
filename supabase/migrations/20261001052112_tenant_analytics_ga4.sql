CREATE TABLE IF NOT EXISTS public.tenant_analytics (
  tenant_id             UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  provisioning_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (provisioning_status IN ('pending','provisioning','ready','failed')),
  ga4_property_id       TEXT,
  ga4_data_stream_id    TEXT,
  ga4_measurement_id    TEXT,
  provisioning_attempts INTEGER NOT NULL DEFAULT 0,
  provisioning_error    TEXT,
  last_attempt_at       TIMESTAMPTZ,
  provisioned_at        TIMESTAMPTZ,
  is_mock               BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ga4_measurement_id_format
    CHECK (ga4_measurement_id IS NULL OR ga4_measurement_id ~ '^G-[A-Z0-9]{4,20}$'),
  CONSTRAINT ready_requires_ids
    CHECK (provisioning_status <> 'ready'
           OR (ga4_property_id IS NOT NULL AND ga4_measurement_id IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_analytics_property_uidx
  ON public.tenant_analytics (ga4_property_id) WHERE ga4_property_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS tenant_analytics_measurement_uidx
  ON public.tenant_analytics (ga4_measurement_id) WHERE ga4_measurement_id IS NOT NULL;

DROP TRIGGER IF EXISTS tenant_analytics_set_updated_at ON public.tenant_analytics;
CREATE TRIGGER tenant_analytics_set_updated_at
  BEFORE UPDATE ON public.tenant_analytics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tenant_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_analytics_select_own" ON public.tenant_analytics
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "tenant_analytics_public_ready" ON public.tenant_analytics
  FOR SELECT TO anon USING (provisioning_status = 'ready');
REVOKE ALL ON public.tenant_analytics FROM anon;
GRANT SELECT (tenant_id, ga4_measurement_id, provisioning_status)
  ON public.tenant_analytics TO anon;

CREATE TABLE IF NOT EXISTS public.analytics_report_cache (
  tenant_id  UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  report     JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.analytics_report_cache ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.analytics_report_cache FROM anon;;
