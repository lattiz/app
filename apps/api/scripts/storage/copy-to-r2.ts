/**
 * Supabase Storage `template-assets` -> Cloudflare R2 copy, verification and DB-reference check.
 * Never deletes anything and never prints credentials. Run from the repo root:
 *
 *   pnpm exec tsx --env-file=apps/api/.env apps/api/scripts/storage/copy-to-r2.ts <command> [flags]
 *
 *   copy   [--dry-run] [--prefix tenant-assets/] [--concurrency 4]
 *   verify [--no-checksum] [--prefix ...]   exit 1 unless count/bytes/type/cache/sha256 all match
 *   refs                                    exit 1 unless every key referenced by the DB exists in R2
 *
 * Env (same names as apps/api/.env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL; `refs` also DATABASE_URL.
 * Test-only overrides: R2_ENDPOINT, R2_FORCE_PATH_STYLE=true, SOURCE_BUCKET.
 *
 * Cut-over order:
 *   1. copy --dry-run, then copy, then verify, then refs (all must pass).
 *   2. STORAGE_PROVIDER=r2 in the API env and restart: new uploads go to R2.
 *   3. copy + verify again to pick up uploads made before the restart.
 *   4. supabase db push (migration rewrite_storage_urls_to_r2), then refs again.
 *   5. verify-pages.ts: no Supabase URL left on any live page, every asset 200.
 *   6. Keep the Supabase bucket ~30 days, then delete it and drop `*.supabase.co`
 *      from apps/tenant-sites/next.config.ts and the Supabase storage adapter.
 */
import postgres from 'postgres';
import {
  copyAll,
  extractReferencedKeys,
  verifyAll,
  type Logger,
} from './copy-core';
import { s3Target, supabaseSource } from './r2-clients';

function flag(args: string[], name: string): boolean {
  return args.includes(`--${name}`);
}

function option(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
}

const logger: Logger = {
  log: (m) => console.log(m),
  error: (m) => console.error(m),
};

function read(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing env ${key}`);
  return value;
}

export function buildStores(env: NodeJS.ProcessEnv = process.env) {
  const supabaseUrl = read(env, 'SUPABASE_URL').replace(/\/+$/, '');
  const bucket = env.SOURCE_BUCKET?.trim() || 'template-assets';
  const localS3 = env.R2_FORCE_PATH_STYLE === 'true';
  const source = supabaseSource({
    url: supabaseUrl,
    serviceRoleKey: read(env, 'SUPABASE_SERVICE_ROLE_KEY'),
    bucket,
  });
  const target = s3Target({
    endpoint:
      env.R2_ENDPOINT?.trim() ||
      `https://${read(env, 'R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    bucket: read(env, 'R2_BUCKET'),
    accessKeyId: read(env, 'R2_ACCESS_KEY_ID'),
    secretAccessKey: read(env, 'R2_SECRET_ACCESS_KEY'),
    forcePathStyle: localS3,
    region: localS3 ? 'local' : 'auto',
  });
  return {
    source,
    target,
    prefixes: {
      oldPrefix: `${supabaseUrl}/storage/v1/object/public/${bucket}/`,
      newPrefix: `${read(env, 'R2_PUBLIC_URL').replace(/\/+$/, '')}/`,
    },
  };
}

const DB_TEXT_SQL = `
  SELECT exported_html AS t FROM public.site_schemas WHERE exported_html IS NOT NULL
  UNION ALL SELECT grapesjs_json::text FROM public.site_schemas
  UNION ALL SELECT grapesjs_json::text FROM public.templates
  UNION ALL SELECT thumbnail_url FROM public.templates WHERE thumbnail_url IS NOT NULL
  UNION ALL SELECT preview_url FROM public.templates WHERE preview_url IS NOT NULL
  UNION ALL SELECT favicon_light_url FROM public.tenants WHERE favicon_light_url IS NOT NULL
  UNION ALL SELECT favicon_dark_url FROM public.tenants WHERE favicon_dark_url IS NOT NULL
  UNION ALL SELECT social_preview_url FROM public.tenants WHERE social_preview_url IS NOT NULL`;

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (!['copy', 'verify', 'refs'].includes(command)) {
    console.error('Usage: copy-to-r2.ts <copy|verify|refs> [flags]');
    process.exit(2);
  }
  const { source, target, prefixes } = buildStores();
  const concurrency = Number(option(args, 'concurrency') ?? 4);
  const prefix = option(args, 'prefix');

  if (command === 'copy') {
    const dryRun = flag(args, 'dry-run');
    const report = await copyAll(
      source,
      target,
      { dryRun, concurrency, prefix },
      logger,
    );
    console.log(
      `\n${dryRun ? 'DRY RUN' : 'COPY'}: ${report.total} object(s) | copied ${report.copied.length} (${report.bytesCopied} B) | would copy ${report.wouldCopy.length} | skipped ${report.skipped.length} | failed ${report.failed.length}`,
    );
    process.exit(report.failed.length > 0 ? 1 : 0);
  }

  if (command === 'verify') {
    const report = await verifyAll(
      source,
      target,
      { checksum: !flag(args, 'no-checksum'), concurrency, prefix },
      logger,
    );
    console.log(
      `\nVERIFY: source ${report.sourceCount} obj / ${report.sourceBytes} B | target ${report.targetCount} obj (${report.targetBytesOfSourceKeys} B for source keys)`,
    );
    console.log(
      `missing ${report.missing.length} | size mismatch ${report.sizeMismatch.length} | content-type mismatch ${report.contentTypeMismatch.length} | no cache-control ${report.missingCacheControl.length} | checksum mismatch ${report.checksumMismatch.length} | extra in target ${report.extraInTarget.length}`,
    );
    console.log(report.ok ? 'RESULT: OK' : 'RESULT: NOT OK');
    process.exit(report.ok ? 0 : 1);
  }

  const sql = postgres(read(process.env, 'DATABASE_URL'), {
    max: 1,
    prepare: false,
  });
  try {
    const rows = await sql.unsafe<Array<{ t: string }>>(DB_TEXT_SQL);
    const referenced = new Set<string>();
    for (const row of rows) {
      for (const key of extractReferencedKeys(row.t, prefixes)) {
        referenced.add(key);
      }
    }
    const present = new Set((await target.list()).map((o) => o.key));
    const missing = [...referenced].filter((k) => !present.has(k)).sort();
    console.log(
      `REFS: ${referenced.size} distinct key(s) referenced by the DB; ${missing.length} missing in R2`,
    );
    for (const key of missing) console.error(`MISSING IN R2 ${key}`);
    process.exit(missing.length > 0 ? 1 : 0);
  } finally {
    await sql.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      `ERROR: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  });
}
