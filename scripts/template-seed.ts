/**
 * Seeds ONE template-kit template into the remote Supabase project (row + R2 assets + preview),
 * leaving every other template untouched: kit:compile → kit:validate → parse-and-seed-template.ts.
 *
 *   pnpm template:seed -- --only <id> [--dry-run] [--no-deploy] [--overwrite-meta] [--motion calm|editorial|none]
 *
 * Every flag besides --only is passed through to the seed (see its --help). Name, category and
 * description come from the manifest; tier and the motion preset from template.meta.json.
 * The seed upserts by id, so re-running is safe. Workflow: docs/template-workflow.md
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '..');

function run(args: string[]): void {
  const result = spawnSync('pnpm', args, { cwd: REPO_ROOT, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const argv = process.argv.slice(2).filter((a) => a !== '--');
const at = argv.indexOf('--only');
const id = at === -1 ? undefined : argv[at + 1];
if (!id || id.startsWith('--')) {
  console.error(
    'Usage: pnpm template:seed -- --only <template-id> [--dry-run] [seed flags…]',
  );
  process.exit(1);
}
const passthrough = argv.filter((_, i) => i !== at && i !== at + 1);
const manifestFile = join('packages/template-kit/templates', `${id}.ts`);
if (!existsSync(resolve(REPO_ROOT, manifestFile))) {
  console.error(
    `✗ ${manifestFile} does not exist (template-kit templates only).`,
  );
  process.exit(1);
}

const kit = ['--filter', '@lattiz/template-kit'];
run([...kit, 'kit:compile', `templates/${id}.ts`]);
run([...kit, 'kit:validate', `dist/${id}`]);

const dist = join('packages/template-kit/dist', id);
const { manifest } = JSON.parse(
  readFileSync(resolve(REPO_ROOT, dist, 'manifest.json'), 'utf8'),
) as { manifest: { name: string; category: string; description: string } };
run([
  'exec',
  'tsx',
  'scripts/parse-and-seed-template.ts',
  '--dir',
  dist,
  '--id',
  id,
  '--name',
  manifest.name,
  '--category',
  manifest.category,
  '--description',
  manifest.description,
  ...passthrough,
]);
if (!passthrough.includes('--dry-run')) {
  console.log(
    `\nVerify the row: select id, tier, is_active, preview_url, thumbnail_url from public.templates where id = '${id}';`,
  );
}
