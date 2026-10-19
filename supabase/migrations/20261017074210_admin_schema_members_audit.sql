-- Not in [api].schemas: PostgREST must not expose this schema.
-- The API connects as the owner. anon and authenticated get no access.

CREATE SCHEMA admin;

REVOKE ALL ON SCHEMA admin FROM PUBLIC, anon, authenticated;

CREATE TABLE admin.members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'operator', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- No FK: the inviter may already have been deleted.
  created_by uuid,
  revoked_at timestamptz
);

CREATE TABLE admin.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- No FK: the row must survive deletion of the actor.
  actor_user_id uuid NOT NULL,
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id text,
  reason text,
  before jsonb,
  after jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_created_at_idx ON admin.audit_log (created_at DESC);

CREATE INDEX audit_log_target_idx ON admin.audit_log (target_type, target_id, created_at DESC);

-- History is corrected by inserting another row, never by editing this one.
CREATE FUNCTION admin.audit_log_append_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'admin.audit_log is append-only';
END;
$$;

REVOKE ALL ON FUNCTION admin.audit_log_append_only() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS audit_log_append_only ON admin.audit_log;
CREATE TRIGGER audit_log_append_only
  BEFORE UPDATE OR DELETE ON admin.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION admin.audit_log_append_only();

CREATE TABLE admin.tenant_flags (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_internal boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- No FK: the editor may already have been deleted.
  updated_by uuid
);

DROP TRIGGER IF EXISTS tenant_flags_set_updated_at ON admin.tenant_flags;
CREATE TRIGGER tenant_flags_set_updated_at
  BEFORE UPDATE ON admin.tenant_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE admin.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.tenant_flags ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE admin.members FROM anon, authenticated;
REVOKE ALL ON TABLE admin.audit_log FROM anon, authenticated;
REVOKE ALL ON TABLE admin.tenant_flags FROM anon, authenticated;
REVOKE ALL ON SEQUENCE admin.audit_log_id_seq FROM anon, authenticated;
