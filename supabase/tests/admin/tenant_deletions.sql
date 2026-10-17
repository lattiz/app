-- admin.tenant_deletions: survives tenant and user delete, one live job, checks, closed to clients.
-- Run (psql is not on the host):
-- docker exec -i supabase_db_lattiz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/admin/tenant_deletions.sql
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

CREATE FUNCTION pg_temp.owner_tenant()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id
  FROM public.tenants
  WHERE user_id = '00000000-0000-0000-0000-0000000ad501'
$$;

SET LOCAL ROLE anon;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.tenant_deletions;
  RAISE EXCEPTION 'anon select admin.tenant_deletions succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $deny$
BEGIN
  PERFORM 1 FROM admin.tenant_deletions;
  RAISE EXCEPTION 'authenticated select admin.tenant_deletions succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
RESET ROLE;

INSERT INTO auth.users (id, email, aud, role)
VALUES (
  '00000000-0000-0000-0000-0000000ad501',
  'tenant-deletion-owner@example.com',
  'authenticated',
  'authenticated'
);

DO $bad_status$
DECLARE
  v_tenant uuid := pg_temp.owner_tenant();
BEGIN
  INSERT INTO admin.tenant_deletions (
    tenant_id, user_id, slug, snapshot, status, reason, actor_user_id
  )
  VALUES (
    v_tenant,
    '00000000-0000-0000-0000-0000000ad501',
    'adm-delete',
    '{}'::jsonb,
    'done',
    'baja de prueba',
    '00000000-0000-0000-0000-0000000ad501'
  );
  RAISE EXCEPTION 'invalid status accepted';
EXCEPTION
  WHEN check_violation THEN
    NULL;
END
$bad_status$;

DO $short_reason$
DECLARE
  v_tenant uuid := pg_temp.owner_tenant();
BEGIN
  INSERT INTO admin.tenant_deletions (
    tenant_id, user_id, slug, snapshot, status, reason, actor_user_id
  )
  VALUES (
    v_tenant,
    '00000000-0000-0000-0000-0000000ad501',
    'adm-delete',
    '{}'::jsonb,
    'pending',
    'ab',
    '00000000-0000-0000-0000-0000000ad501'
  );
  RAISE EXCEPTION 'short reason accepted';
EXCEPTION
  WHEN check_violation THEN
    NULL;
END
$short_reason$;

DO $long_reason$
DECLARE
  v_tenant uuid := pg_temp.owner_tenant();
BEGIN
  INSERT INTO admin.tenant_deletions (
    tenant_id, user_id, slug, snapshot, status, reason, actor_user_id
  )
  VALUES (
    v_tenant,
    '00000000-0000-0000-0000-0000000ad501',
    'adm-delete',
    '{}'::jsonb,
    'pending',
    repeat('x', 501),
    '00000000-0000-0000-0000-0000000ad501'
  );
  RAISE EXCEPTION 'long reason accepted';
EXCEPTION
  WHEN check_violation THEN
    NULL;
END
$long_reason$;

INSERT INTO admin.tenant_deletions (
  id,
  tenant_id,
  user_id,
  slug,
  snapshot,
  notify_email,
  status,
  reason,
  actor_user_id,
  actor_email
)
SELECT
  '00000000-0000-0000-0000-0000000ad521',
  t.id,
  t.user_id,
  t.slug,
  jsonb_build_object(
    'domain', 'adm-delete.example',
    'registrar_domain_id', 'op-1',
    'expires_at', '2027-01-01T00:00:00Z',
    'dns_provider', 'cloudflare',
    'dns_zone_id', 'zone-1',
    'source', 'lattiz_managed',
    'ga4_property_id', 'properties/1',
    'stripe_customer_id', 'cus_test',
    'subscription_ids', jsonb_build_array('sub_test'),
    'r2_bytes', jsonb_build_object('assets', 10, 'branding', 2),
    'pending_emails', jsonb_build_array('outbox-1')
  ),
  'aviso@example.com',
  'pending',
  repeat('x', 3),
  '00000000-0000-0000-0000-0000000ad501',
  'actor@example.com'
FROM public.tenants t
WHERE t.user_id = '00000000-0000-0000-0000-0000000ad501';

SELECT pg_temp.expect(
  (
    SELECT
      status = 'pending'
      AND notify_customer = true
      AND steps = '[]'::jsonb
      AND char_length(reason) = 3
      AND notify_email = 'aviso@example.com'
    FROM admin.tenant_deletions
    WHERE id = '00000000-0000-0000-0000-0000000ad521'
  ),
  'defaults and minimum reason'
);

DO $second_pending$
DECLARE
  v_tenant uuid := pg_temp.owner_tenant();
BEGIN
  INSERT INTO admin.tenant_deletions (
    tenant_id, user_id, slug, snapshot, status, reason, actor_user_id
  )
  VALUES (
    v_tenant,
    '00000000-0000-0000-0000-0000000ad501',
    'adm-delete',
    '{}'::jsonb,
    'pending',
    'segundo trabajo',
    '00000000-0000-0000-0000-0000000ad501'
  );
  RAISE EXCEPTION 'second pending job accepted';
EXCEPTION
  WHEN unique_violation THEN
    NULL;
END
$second_pending$;

UPDATE admin.tenant_deletions
SET status = 'running', updated_at = timestamptz '2000-01-01'
WHERE id = '00000000-0000-0000-0000-0000000ad521';

SELECT pg_temp.expect(
  (
    SELECT updated_at > now() - interval '1 minute'
    FROM admin.tenant_deletions
    WHERE id = '00000000-0000-0000-0000-0000000ad521'
  ),
  'updated_at trigger'
);

DO $second_running$
DECLARE
  v_tenant uuid := pg_temp.owner_tenant();
BEGIN
  INSERT INTO admin.tenant_deletions (
    tenant_id, user_id, slug, snapshot, status, reason, actor_user_id
  )
  VALUES (
    v_tenant,
    '00000000-0000-0000-0000-0000000ad501',
    'adm-delete',
    '{}'::jsonb,
    'running',
    'segundo trabajo',
    '00000000-0000-0000-0000-0000000ad501'
  );
  RAISE EXCEPTION 'second running job accepted';
EXCEPTION
  WHEN unique_violation THEN
    NULL;
END
$second_running$;

UPDATE admin.tenant_deletions
SET status = 'failed'
WHERE id = '00000000-0000-0000-0000-0000000ad521';

DO $second_failed$
DECLARE
  v_tenant uuid := pg_temp.owner_tenant();
BEGIN
  INSERT INTO admin.tenant_deletions (
    tenant_id, user_id, slug, snapshot, status, reason, actor_user_id
  )
  VALUES (
    v_tenant,
    '00000000-0000-0000-0000-0000000ad501',
    'adm-delete',
    '{}'::jsonb,
    'pending',
    'reintento paralelo',
    '00000000-0000-0000-0000-0000000ad501'
  );
  RAISE EXCEPTION 'second job accepted while failed is live';
EXCEPTION
  WHEN unique_violation THEN
    NULL;
END
$second_failed$;

UPDATE admin.tenant_deletions
SET status = 'completed', notify_email = NULL, finished_at = now()
WHERE id = '00000000-0000-0000-0000-0000000ad521';

INSERT INTO admin.tenant_deletions (
  id,
  tenant_id,
  user_id,
  slug,
  snapshot,
  status,
  reason,
  actor_user_id
)
SELECT
  '00000000-0000-0000-0000-0000000ad522',
  t.id,
  t.user_id,
  t.slug,
  '{}'::jsonb,
  'pending',
  repeat('y', 500),
  '00000000-0000-0000-0000-0000000ad501'
FROM public.tenants t
WHERE t.user_id = '00000000-0000-0000-0000-0000000ad501';

SELECT pg_temp.expect(
  (
    SELECT count(*) = 2
    FROM admin.tenant_deletions
    WHERE tenant_id = pg_temp.owner_tenant()
  ),
  'new job allowed after completed'
);

DELETE FROM public.tenants WHERE id = pg_temp.owner_tenant();
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-0000000ad501';

SELECT pg_temp.expect(
  (
    SELECT
      NOT EXISTS (
        SELECT 1
        FROM public.tenants
        WHERE user_id = '00000000-0000-0000-0000-0000000ad501'
      )
      AND NOT EXISTS (
        SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-0000000ad501'
      )
      AND (
        SELECT count(*) = 2
        FROM admin.tenant_deletions
        WHERE user_id = '00000000-0000-0000-0000-0000000ad501'
          AND slug = 'tenant-00000000'
      )
  ),
  'deletion rows survived tenant and user delete'
);

ROLLBACK;
