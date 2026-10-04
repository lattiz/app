/**
 * Parse a GrapesJS `.grapesjs` export, re-host its cdn.grapesjs.com assets into
 * the active object storage (STORAGE_PROVIDER=r2|supabase, same env as the API),
 * rewrite the URLs in the project JSON, and upsert the result into `public.templates`.
 *
 * Usage:
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJh... \
 *   STORAGE_PROVIDER=r2 R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
 *   R2_BUCKET=lattiz-assets R2_PUBLIC_URL=https://assets.lattiz.app \
 *   npx tsx scripts/parse-and-seed-template.ts \
 *     --file ./apps/web/lattiz-test.grapesjs \
 *     --id neuraltech-v1 \
 *     --name "NeuralTech AI" \
 *     --category tecnologia \
 *     --preview-url https://templates.lattiz.com/neuraltech-v1
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { ObjectStoragePort } from '../apps/api/src/modules/storage/domain/object-storage.port';
import {
  createObjectStorage,
  resolveStorageProvider,
} from '../apps/api/src/modules/storage/infrastructure/storage-provider.factory';

const BUCKET = 'template-assets';
const CDN_HOST = 'cdn.grapesjs.com';
// Matches any cdn.grapesjs.com URL wherever it appears in the serialized JSON.
const CDN_URL_RE = /https?:\/\/cdn\.grapesjs\.com\/[^\s"'\\)]+/g;

interface GrapesAsset {
  id?: string;
  src?: string;
  name?: string;
  mimeType?: string;
}

interface GrapesProject {
  assets?: GrapesAsset[];
  custom?: { id?: string; plugins?: unknown[] };
  [key: string]: unknown;
}

interface CliArgs {
  file: string;
  id: string;
  name: string;
  category: string;
  previewUrl?: string;
}

const MANUAL_STORAGE_STEP = `
⚠️  MANUAL STEP REQUIRED — Supabase Storage Bucket
──────────────────────────────────────────────────
1. Open your Supabase project dashboard
2. Navigate to Storage → New bucket
3. Bucket name: ${BUCKET}
4. Public bucket: ✓ (toggle ON)
5. Click Save
6. Then re-run this seed script
──────────────────────────────────────────────────`;

// TODO: MANUAL STEP — the Supabase Storage bucket `template-assets` cannot be
// created via SQL/API here. Create it once (public) before running this script.

function printHelp(): void {
  console.log(`parse-and-seed-template — seed a GrapesJS template into public.templates

Required env:
  SUPABASE_URL                Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY   Service role key (server-only)
  STORAGE_PROVIDER            r2 | supabase (default supabase); with r2 also
                              R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
                              R2_BUCKET, R2_PUBLIC_URL (same as apps/api/.env)

Flags:
  --file <path>          Path to the .grapesjs export file        (required)
  --id <id>              Template id (primary key, upsert key)     (required)
  --name <name>          Human-readable template name             (required)
  --category <cat>       Template category            (default: general)
  --preview-url <url>    Public preview URL                       (optional)
  --help                 Show this help

Example:
  SUPABASE_URL=https://xxxx.supabase.co \\
  SUPABASE_SERVICE_ROLE_KEY=eyJh... \\
  npx tsx scripts/parse-and-seed-template.ts \\
    --file ./apps/web/lattiz-test.grapesjs \\
    --id neuraltech-v1 --name "NeuralTech AI" \\
    --category tecnologia --preview-url https://templates.lattiz.com/neuraltech-v1`);
}

function parseArgs(argv: string[]): CliArgs {
  const raw = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eq = token.indexOf('=');
    if (eq !== -1) {
      raw.set(token.slice(2, eq), token.slice(eq + 1));
    } else {
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        raw.set(token.slice(2), next);
        i += 1;
      } else {
        raw.set(token.slice(2), 'true');
      }
    }
  }

  const file = raw.get('file');
  const id = raw.get('id');
  const name = raw.get('name');
  const missing = [
    ['--file', file],
    ['--id', id],
    ['--name', name],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(`Missing required flag(s): ${missing.join(', ')}`);
  }

  return {
    file: file as string,
    id: id as string,
    name: name as string,
    category: raw.get('category') ?? 'general',
    previewUrl: raw.get('preview-url'),
  };
}

function requireEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Environment variable ${key} is required.`);
  return value;
}

function extFromUrl(url: string): string {
  const pathname = new URL(url).pathname;
  const match = /\.([a-zA-Z0-9]+)$/.exec(pathname);
  return match ? `.${match[1].toLowerCase()}` : '';
}

function extFromMime(mime: string | undefined): string {
  if (!mime) return '';
  const map: Record<string, string> = {
    'image/webp': '.webp',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  return map[mime] ?? '';
}

/** Stable, filesystem-safe asset id from a cdn URL when the asset isn't in assets[]. */
function idFromUrl(url: string): string {
  const last = new URL(url).pathname.split('/').pop() ?? 'asset';
  const beforeDoubleUnderscore = last.split('__')[0];
  return beforeDoubleUnderscore.replace(/[^a-zA-Z0-9._-]/g, '') || 'asset';
}

async function rehostAsset(
  storage: ObjectStoragePort,
  templateId: string,
  url: string,
  meta: GrapesAsset | undefined,
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${res.statusText}`);
  const contentType = meta?.mimeType ?? res.headers.get('content-type') ?? undefined;
  const bytes = new Uint8Array(await res.arrayBuffer());

  const assetId = meta?.id ?? idFromUrl(url);
  const ext = extFromUrl(url) || extFromMime(contentType);
  const path = `${templateId}/${assetId}${ext}`;

  // Keys are deterministic (re-runs overwrite), hence upsert: it keeps the cache lifetime short.
  return storage.uploadPublic(
    path,
    Buffer.from(bytes),
    contentType ?? 'application/octet-stream',
    { upsert: true },
  );
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return;
  }

  const provider = resolveStorageProvider((key) => process.env[key]);
  if (provider === 'supabase') console.log(MANUAL_STORAGE_STEP);

  const args = parseArgs(argv);
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const storage = createObjectStorage((key) => process.env[key]);

  const filePath = resolve(process.cwd(), args.file);
  console.log(`\n▶ Reading ${filePath}`);
  const parsed: unknown = JSON.parse(readFileSync(filePath, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Template file is not a valid JSON object.');
  }
  const project = parsed as GrapesProject;

  const serialized = JSON.stringify(project);
  const uniqueUrls = [...new Set(serialized.match(CDN_URL_RE) ?? [])];
  console.log(`▶ Found ${uniqueUrls.length} unique ${CDN_HOST} asset URL(s)\n`);

  const metaBySrc = new Map<string, GrapesAsset>();
  for (const asset of project.assets ?? []) {
    if (asset.src) metaBySrc.set(asset.src, asset);
  }

  const replacements = new Map<string, string>();
  let ok = 0;
  let failed = 0;
  for (const url of uniqueUrls) {
    try {
      const newUrl = await rehostAsset(storage, args.id, url, metaBySrc.get(url));
      replacements.set(url, newUrl);
      ok += 1;
      console.log(`  ✓ ${url}\n      → ${newUrl}`);
    } catch (err) {
      failed += 1;
      console.error(`  ✗ ${url}\n      ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (failed > 0) {
    console.error(
      `\n✗ ${failed} asset(s) failed. Check the storage credentials and that the public bucket exists, then retry.`,
    );
    process.exitCode = 1;
    return;
  }

  let rewritten = serialized;
  for (const [oldUrl, newUrl] of replacements) {
    rewritten = rewritten.split(oldUrl).join(newUrl);
  }
  const processedJson: unknown = JSON.parse(rewritten);

  console.log(`\n▶ Upserting template "${args.id}" into public.templates`);
  const { error } = await supabase.from('templates').upsert(
    {
      id: args.id,
      name: args.name,
      category: args.category,
      preview_url: args.previewUrl ?? null,
      grapesjs_json: processedJson,
      is_active: true,
    },
    { onConflict: 'id' },
  );
  if (error) throw new Error(error.message);

  console.log(`\n✅ Seeded template "${args.id}" (${ok} asset(s) re-hosted).`);
  console.log(`
✅ Template seeded. Next steps:
   1. Take a screenshot of ${args.previewUrl ?? 'the template preview'}
      and upload it to the assets bucket as:
      ${args.id}/thumbnail.jpg
   2. Run: UPDATE public.templates
            SET thumbnail_url = '${storage.publicUrl(`${args.id}/thumbnail.jpg`)}'
            WHERE id = '${args.id}';
   3. Create a test tenant row (replace the uid with your Supabase auth user id):
      INSERT INTO public.tenants (user_id, slug, name)
      VALUES ('<your-supabase-auth-uid>', 'test-tenant', 'Test Tenant');
   4. Start the web app:  pnpm --filter @lattiz/web dev
   5. Navigate to /editor/<tenantId> and verify the template loads in StudioEditor`);
}

main().catch((err) => {
  console.error(`\n✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
