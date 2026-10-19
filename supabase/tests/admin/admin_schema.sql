-- admin schema: closed to anon/authenticated, append-only audit, cascades.
-- Run (psql is not on the host):
-- docker exec -i supabase_db_lattiz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/admin/admin_schema.sql
\set ON_ERROR_STOP on

BEGIN;

CREATE FUNCTION pg_temp.expect(p_ok boolean, p_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT COALESCE(p_ok, false) THEN
    RAISE EXCEPTION '%', p_msg;
  END IF;
END;
$$;

SET LOCAL ROLE anon;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.members;
  RAISE EXCEPTION 'anon select admin.members succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.audit_log;
  RAISE EXCEPTION 'anon select admin.audit_log succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.tenant_flags;
  RAISE EXCEPTION 'anon select admin.tenant_flags succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.members;
  RAISE EXCEPTION 'authenticated select admin.members succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.audit_log;
  RAISE EXCEPTION 'authenticated select admin.audit_log succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.tenant_flags;
  RAISE EXCEPTION 'authenticated select admin.tenant_flags succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
RESET ROLE;

INSERT INTO auth.users (id, email, aud, role)
VALUES (
  '00000000-0000-0000-0000-0000000ad101',
  'admin-member@example.com',
  'authenticated',
  'authenticated'
);

DO $bad_role$
BEGIN
  INSERT INTO admin.members (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000ad101', 'admin');
  RAISE EXCEPTION 'invalid role accepted';
EXCEPTION
  WHEN check_violation THEN
    NULL;
END
$bad_role$;

INSERT INTO admin.audit_log (
  actor_user_id,
  actor_email,
  action,
  target_type,
  target_id,
  reason,
  before,
  after,
  ip,
  user_agent
)
VALUES (
  '00000000-0000-0000-0000-0000000ad101',
  'actor@example.com',
  'member.grant',
  'admin.members',
  '00000000-0000-0000-0000-0000000ad101',
  'alta de prueba',
  '{"role":null}'::jsonb,
  '{"role":"operator"}'::jsonb,
  '127.0.0.1',
  'psql'
);

DO $audit_update$
BEGIN
  UPDATE admin.audit_log SET action = 'tamper' WHERE action = 'member.grant';
  RAISE EXCEPTION 'audit update succeeded';
EXCEPTION
  WHEN raise_exception THEN
    IF SQLERRM = 'audit update succeeded' THEN
      RAISE;
    END IF;
END
$audit_update$;

DO $audit_delete$
BEGIN
  DELETE FROM admin.audit_log WHERE action = 'member.grant';
  RAISE EXCEPTION 'audit delete succeeded';
EXCEPTION
  WHEN raise_exception THEN
    IF SQLERRM = 'audit delete succeeded' THEN
      RAISE;
    END IF;
END
$audit_delete$;

SELECT pg_temp.expect(
  (
    SELECT count(*) = 1
    FROM admin.audit_log
    WHERE action = 'member.grant'
      AND actor_email = 'actor@example.com'
  ),
  'audit insert kept'
);

INSERT INTO public.tenants (slug, name, plan, status)
VALUES ('adm-flags', 'Admin Flags', 'none', 'active');

INSERT INTO admin.tenant_flags (tenant_id, is_internal, tags, notes)
SELECT id, true, ARRAY['qa']::text[], 'cuenta interna'
FROM public.tenants
WHERE slug = 'adm-flags';

DELETE FROM public.tenants WHERE slug = 'adm-flags';

SELECT pg_temp.expect(
  NOT EXISTS (
    SELECT 1
    FROM admin.tenant_flags
    WHERE notes = 'cuenta interna'
  ),
  'tenant delete cascades tenant_flags'
);

INSERT INTO admin.members (user_id, role)
VALUES ('00000000-0000-0000-0000-0000000ad101', 'operator');

DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-0000000ad101';

SELECT pg_temp.expect(
  NOT EXISTS (
    SELECT 1
    FROM admin.members
    WHERE user_id = '00000000-0000-0000-0000-0000000ad101'
  ),
  'auth.users delete cascades admin.members'
);

ROLLBACK;
