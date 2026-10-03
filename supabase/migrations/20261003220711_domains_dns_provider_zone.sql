-- Which DNS provider hosts a Lattiz-managed domain's zone, and the provider-side zone id
-- (Cloudflare zone id; the domain name for Openprovider). NULL for user_provided domains.
ALTER TABLE public.domains
  ADD COLUMN IF NOT EXISTS dns_provider TEXT
    CHECK (dns_provider IN ('cloudflare', 'openprovider')),
  ADD COLUMN IF NOT EXISTS dns_zone_id TEXT,
  -- Last time we asked the provider to re-check nameserver delegation (Cloudflare Free allows one per hour).
  ADD COLUMN IF NOT EXISTS dns_activation_checked_at TIMESTAMPTZ;

ALTER TABLE public.domains
  ADD CONSTRAINT domains_dns_zone_requires_provider
    CHECK (dns_zone_id IS NULL OR dns_provider IS NOT NULL);

-- Stable machine code for a failed job; the web maps it to a message. Technical detail goes to the API logs only.
ALTER TABLE public.domain_jobs
  ADD COLUMN IF NOT EXISTS error_code TEXT;

-- Jobs still in flight when this ships belong to a process that no longer exists.
UPDATE public.domain_jobs
SET status = 'failed', error_code = 'PURCHASE_INTERRUPTED'
WHERE job_type = 'purchase' AND status NOT IN ('completed', 'failed');

-- At most one running purchase per tenant: a double click or concurrent request cannot start a second pipeline.
CREATE UNIQUE INDEX IF NOT EXISTS domain_jobs_one_running_purchase_idx
  ON public.domain_jobs (tenant_id)
  WHERE job_type = 'purchase' AND status NOT IN ('completed', 'failed');
