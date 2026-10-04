/**
 * After the URL-rewrite migration: (optionally) pings tenant-sites' /api/revalidate for every tenant host,
 * fetches each live page and checks that no Supabase Storage URL remains and every assets URL answers 200.
 * Read-only except for the optional revalidate POST. Run from the repo root:
 *
 *   pnpm exec tsx --env-file=apps/api/.env apps/api/scripts/storage/verify-pages.ts [--revalidate] [--hosts a.lattiz.app,b.example.com]
 *
 * Env: DATABASE_URL (host discovery, unless --hosts), PREVIEW_BASE_DOMAIN (default lattiz.app),
 * ASSETS_HOST (default assets.lattiz.app); --revalidate also TENANT_SITES_URL + REVALIDATION_SECRET.
 * tenant-sites reads the DB on every request (s-maxage=0), so rewritten HTML is live as soon as the
 * migration commits; --revalidate only matters if page caching is turned on later.
 */
import postgres from 'postgres';

export interface PageFinding {
  host: string;
  status: number;
  supabaseRefs: string[];
  assetUrls: string[];
  brokenAssets: Array<{ url: string; status: number | string }>;
}

export function extractUrls(html: string): string[] {
  const normalized = html
    .replace(/\\+\//g, '/')
    .replace(/&quot;|&amp;/g, (m) => (m === '&amp;' ? '&' : '"'));
  const found = normalized.match(/https?:\/\/[^\s"'<>()\\]+/g) ?? [];
  return [...new Set(found.map((u) => u.replace(/[.,;]+$/, '')))];
}

export async function checkPage(
  host: string,
  assetsHost: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PageFinding> {
  const res = await fetchImpl(`https://${host}/`, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
  });
  const html = await res.text();
  const urls = extractUrls(html);
  const supabaseRefs = urls.filter((u) =>
    /\.supabase\.co\/storage\/v1\//.test(u),
  );
  const assetUrls = urls.filter((u) => new URL(u).host === assetsHost);
  const brokenAssets: PageFinding['brokenAssets'] = [];
  for (const url of assetUrls) {
    try {
      let r = await fetchImpl(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(15_000),
      });
      if (r.status === 405 || r.status === 403) {
        r = await fetchImpl(url, { signal: AbortSignal.timeout(15_000) });
      }
      if (r.status !== 200) brokenAssets.push({ url, status: r.status });
    } catch (error) {
      brokenAssets.push({
        url,
        status: error instanceof Error ? error.message : 'error',
      });
    }
  }
  return { host, status: res.status, supabaseRefs, assetUrls, brokenAssets };
}

async function discoverHosts(
  databaseUrl: string,
  baseDomain: string,
): Promise<string[]> {
  if (!databaseUrl)
    throw new Error('Missing env DATABASE_URL (or pass --hosts)');
  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    const rows = await sql<Array<{ slug: string; domain: string | null }>>`
      SELECT t.slug, t.domain FROM public.tenants t
      JOIN public.site_schemas s ON s.tenant_id = t.id
      WHERE s.status = 'published' AND s.exported_html IS NOT NULL`;
    return rows.flatMap((r) => [
      `${r.slug}.${baseDomain}`,
      ...(r.domain ? [r.domain] : []),
    ]);
  } finally {
    await sql.end();
  }
}

async function revalidate(host: string): Promise<void> {
  const base = process.env.TENANT_SITES_URL?.trim();
  const secret = process.env.REVALIDATION_SECRET?.trim();
  if (!base || !secret) {
    throw new Error(
      '--revalidate needs TENANT_SITES_URL and REVALIDATION_SECRET',
    );
  }
  const res = await fetch(`${base}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ tenantHostname: host }),
    signal: AbortSignal.timeout(10_000),
    redirect: 'error',
  });
  console.log(`revalidate ${host}: ${res.status}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const hostsIndex = args.indexOf('--hosts');
  const hostsArg = hostsIndex === -1 ? undefined : args[hostsIndex + 1];
  const baseDomain = (
    process.env.PREVIEW_BASE_DOMAIN?.trim() || 'lattiz.app'
  ).toLowerCase();
  const assetsHost = process.env.ASSETS_HOST?.trim() || 'assets.lattiz.app';
  const hosts = hostsArg
    ? hostsArg
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean)
    : await discoverHosts(process.env.DATABASE_URL?.trim() ?? '', baseDomain);

  let failures = 0;
  for (const host of hosts) {
    if (args.includes('--revalidate')) await revalidate(host);
    const f = await checkPage(host, assetsHost);
    const bad =
      f.status !== 200 ||
      f.supabaseRefs.length > 0 ||
      f.brokenAssets.length > 0;
    if (bad) failures += 1;
    console.log(
      `${bad ? 'FAIL' : 'ok  '} ${host} -> ${f.status} | assets ${f.assetUrls.length} | supabase refs ${f.supabaseRefs.length} | broken ${f.brokenAssets.length}`,
    );
    for (const u of f.supabaseRefs) console.error(`  still Supabase: ${u}`);
    for (const b of f.brokenAssets) {
      console.error(`  broken (${b.status}): ${b.url}`);
    }
  }
  console.log(`\n${hosts.length} host(s) checked, ${failures} failing`);
  process.exit(failures > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      `ERROR: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  });
}
