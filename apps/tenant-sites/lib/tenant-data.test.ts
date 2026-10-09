import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon-test-key';
process.env.PREVIEW_BASE_DOMAIN = 'lattiz.app';

describe('resolveTenantSite', () => {
  it('calls get_public_tenant_site without p_trial_days', async (t) => {
    const { supabase } = await import('./supabase');
    const { resolveTenantSite } = await import('./tenant-data');
    const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
    t.mock.method(
      supabase,
      'rpc',
      async (fn: string, args: Record<string, unknown>) => {
        calls.push({ fn, args });
        return { data: [], error: null };
      },
    );

    await resolveTenantSite('cafe.lattiz.app');
    await resolveTenantSite('tienda.example.com');

    assert.deepEqual(calls, [
      { fn: 'get_public_tenant_site', args: { p_slug: 'cafe' } },
      {
        fn: 'get_public_tenant_site',
        args: { p_domain: 'tienda.example.com' },
      },
    ]);
    for (const call of calls) {
      assert.equal(Object.hasOwn(call.args, 'p_trial_days'), false);
    }
  });
});
