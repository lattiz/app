CREATE TABLE IF NOT EXISTS public.domain_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain      TEXT NOT NULL,

  status      TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'purchasing',
      'configuring_dns',
      'registering_vercel',
      'completed',
      'failed'
    )),

  steps_completed  TEXT[] NOT NULL DEFAULT '{}',
  error_message    TEXT,
  error_step       TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domain_jobs_select_own" ON public.domain_jobs
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );;
