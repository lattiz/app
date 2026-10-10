-- One included Lattiz domain per account. Survives release: preparePurchase deletes
-- the domains row, so the mark has to live on the tenant.
-- anon/authenticated already lack INSERT/UPDATE/DELETE/TRUNCATE on tenants
-- (20261004002100). That revoke is table-wide, not a column list, so this
-- column is not writable by those roles either.
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS included_domain_used_at TIMESTAMPTZ;

UPDATE public.tenants AS t
SET included_domain_used_at = earliest.purchase_completed_at
FROM (
  SELECT tenant_id, MIN(purchase_completed_at) AS purchase_completed_at
  FROM public.domains
  WHERE source = 'lattiz_managed'
    AND is_mock = false
    AND purchase_completed_at IS NOT NULL
  GROUP BY tenant_id
) AS earliest
WHERE t.id = earliest.tenant_id;
