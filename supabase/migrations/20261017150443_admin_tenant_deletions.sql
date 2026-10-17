-- Full tenant-deletion jobs. No FK to public.tenants or auth.users: the row
-- must survive both cascades. admin.tenant_flags and admin.storage_usage already
-- ON DELETE CASCADE (20261017074210, 20261017091058).
-- Not in [api].schemas. The API connects as the owner.
-- anon and authenticated get no access.

CREATE TABLE admin.tenant_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  slug text NOT NULL,
  -- Identifiers captured when the job starts: domain, registrar_domain_id,
  -- expires_at, dns_provider, dns_zone_id, source, ga4_property_id,
  -- stripe_customer_id, subscription_ids, r2_bytes, pending_emails.
  snapshot jsonb NOT NULL,
  -- Temporary address for the notice. Set back to NULL when the job finishes.
  notify_email text,
  notify_customer boolean NOT NULL DEFAULT true,
  status text NOT NULL CHECK (
    status IN ('pending', 'running', 'completed', 'completed_manual', 'failed')
  ),
  -- List of { key, status: pending|running|done|skipped|manual|failed,
  -- startedAt, finishedAt, detail, error }.
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  actor_user_id uuid NOT NULL,
  actor_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

-- One in-flight job per tenant. failed stays live because it is retried.
-- completed and completed_manual release the slot.
CREATE UNIQUE INDEX tenant_deletions_one_live_idx
  ON admin.tenant_deletions (tenant_id)
  WHERE status IN ('pending', 'running', 'failed');

CREATE INDEX tenant_deletions_created_at_idx
  ON admin.tenant_deletions (created_at DESC);

DROP TRIGGER IF EXISTS tenant_deletions_set_updated_at ON admin.tenant_deletions;
CREATE TRIGGER tenant_deletions_set_updated_at
  BEFORE UPDATE ON admin.tenant_deletions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE admin.tenant_deletions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE admin.tenant_deletions FROM PUBLIC, anon, authenticated;
