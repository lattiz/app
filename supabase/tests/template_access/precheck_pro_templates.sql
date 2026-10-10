-- READ-ONLY pre-check before marking templates as `pro` (re-seed with --tier pro).
-- Lists every tenant whose site uses one of those templates and whose plan does
-- not include Pro, with what would happen to them. It changes nothing: the owner
-- decides per tenant (grandfather on a Básico copy, move, or upgrade).
--
-- Run (local):  psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/template_access/precheck_pro_templates.sql
-- Other ids:    add  -v pro_ids="'id-a','id-b'"
\set ON_ERROR_STOP on
\if :{?pro_ids}
\else
  \set pro_ids '''barberia-oxido-v1'', ''barberia-norte-v1'', ''barberia-concreto-v1'''
\endif

BEGIN READ ONLY;

WITH latest_sub AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, status, current_period_end
  FROM public.subscriptions
  ORDER BY tenant_id, created_at DESC
),
affected AS (
  SELECT t.id AS tenant_id,
         t.name AS tenant_name,
         t.slug,
         t.plan,
         ls.status AS subscription_status,
         ls.current_period_end,
         (ls.status IN ('active', 'trialing') AND ls.current_period_end > now()) AS is_entitled,
         ss.template_id,
         ss.status AS site_status
  FROM public.site_schemas ss
  JOIN public.tenants t ON t.id = ss.tenant_id
  LEFT JOIN latest_sub ls ON ls.tenant_id = t.id
  WHERE ss.template_id IN (:pro_ids)
)
SELECT tenant_id, tenant_name, slug, plan, subscription_status, current_period_end,
       template_id, site_status,
       CASE
         WHEN is_entitled AND plan NOT IN ('pro', 'empresarial')
           THEN 'WOULD_LOCK: editing blocked until they switch or upgrade (site stays online)'
         WHEN NOT COALESCE(is_entitled, false) AND plan IN ('none', 'trial')
           THEN 'UNPAID_ON_PRO: not locked, but could no longer pick this template'
         ELSE 'LAPSED: not locked (subscription lockout applies); locks if they resubscribe Básico'
       END AS outcome
FROM affected
WHERE NOT (COALESCE(is_entitled, false) AND plan IN ('pro', 'empresarial'))
ORDER BY outcome, tenant_name;

ROLLBACK;
