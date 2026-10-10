/**
 * Squint test: perceptual distance between every pair of templates of a vertical, plus a contact sheet.
 *
 *   pnpm --filter @lattiz/template-kit kit:compare-visual [dist/<id> …] [--sheet file.png]
 *
 * No args = every built dist/<id>. Needs kit:shoot output (thumbnail.jpg, review/desktop-full.png).
 * Writes dist/_contact-sheet.png (all templates at thumbnail size, labeled) and exits 1 when a pair
 * scores under MIN_VISUAL_DISTANCE.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import sharp from 'sharp';
import { KitError, parseArgs, runCli } from '../lib/args';
import { escapeHtml } from '../lib/dom';
import { paths } from '../lib/paths';
import {
  FOLD_SIZE,
  MIN_VISUAL_DISTANCE,
  PAGE_SIZE,
  loadRaster,
  visualDistance,
  type Raster,
} from '../lib/visual';

interface Shot {
  dir: string;
  id: string;
  vertical: string;
  tier: string;
  theme: string;
  thumbnail: string;
  fold: Raster;
  page: Raster;
}

function builtDirs(): string[] {
  if (!existsSync(paths.dist)) return [];
  return readdirSync(paths.dist)
    .map((d) => resolve(paths.dist, d))
    .filter((d) => statSync(d).isDirectory());
}

async function loadShot(dir: string): Promise<Shot> {
  const snapshot = resolve(dir, 'manifest.json');
  const thumbnail = resolve(dir, 'thumbnail.jpg');
  const full = resolve(dir, 'review/desktop-full.png');
  for (const f of [snapshot, thumbnail, full])
    if (!existsSync(f))
      throw new KitError(
        `${f} is missing; run kit:build (or kit:compile + kit:shoot) first.`,
      );
  const raw = JSON.parse(readFileSync(snapshot, 'utf8')) as {
    manifest: { id: string; vertical: string; tier?: string; theme: string };
  };
  return {
    dir,
    id: raw.manifest.id,
    vertical: raw.manifest.vertical,
    tier: raw.manifest.tier ?? '—',
    theme: raw.manifest.theme,
    thumbnail,
    fold: await loadRaster(thumbnail, FOLD_SIZE.width, FOLD_SIZE.height),
    page: await loadRaster(full, PAGE_SIZE.width, PAGE_SIZE.height),
  };
}

const TILE = { width: 320, height: 200, label: 44 } as const;

async function contactSheet(shots: Shot[], file: string): Promise<void> {
  const cols = Math.min(3, shots.length);
  const rows = Math.ceil(shots.length / cols);
  const gap = 16;
  const cellH = TILE.height + TILE.label;
  const tiles = await Promise.all(
    shots.map(async (s, i) => {
      const image = await sharp(s.thumbnail)
        .resize(TILE.width, TILE.height, { fit: 'cover', position: 'top' })
        .toBuffer();
      const label = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE.width}" height="${TILE.label}"><text x="0" y="18" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#111111">${escapeHtml(s.id)}</text><text x="0" y="36" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#555555">${escapeHtml(`${s.tier} · ${s.theme}`)}</text></svg>`,
      );
      const left = gap + (i % cols) * (TILE.width + gap);
      const top = gap + Math.floor(i / cols) * (cellH + gap);
      return [
        { input: image, left, top },
        { input: label, left, top: top + TILE.height + 4 },
      ];
    }),
  );
  await sharp({
    create: {
      width: gap + cols * (TILE.width + gap),
      height: gap + rows * (cellH + gap),
      channels: 3,
      background: '#FFFFFF',
    },
  })
    .composite(tiles.flat())
    .png()
    .toFile(file);
}

async function main(): Promise<void> {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const dirs =
    positional.length > 0
      ? positional.map((p) => resolve(process.cwd(), p))
      : builtDirs();
  const shots = await Promise.all(dirs.map(loadShot));
  if (shots.length === 0)
    throw new KitError('No built templates found in dist/.');

  let ok = true;
  const verticals = [...new Set(shots.map((s) => s.vertical))];
  for (const vertical of verticals) {
    const group = shots.filter((s) => s.vertical === vertical);
    console.log(
      `\n── ${vertical}: above the fold (fail < ${MIN_VISUAL_DISTANCE}) · full page (reported)`,
    );
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const [a, b] = [group[i], group[j]];
        const fold = visualDistance(a.fold, b.fold);
        const page = visualDistance(a.page, b.page);
        const pass = fold >= MIN_VISUAL_DISTANCE;
        ok = ok && pass;
        console.log(
          `  ${pass ? '✓' : '✗'} ${a.id} ~ ${b.id}: ${fold.toFixed(3)} · ${page.toFixed(3)}`,
        );
      }
    }
  }
  const sheet = resolve(
    process.cwd(),
    flags.get('sheet') ?? resolve(paths.dist, '_contact-sheet.png'),
  );
  await contactSheet(shots, sheet);
  console.log(
    `\n📇 contact sheet → ${relative(process.cwd(), sheet) || basename(sheet)}`,
  );
  if (!ok) {
    console.error(
      '\n✗ Some templates look alike at thumbnail size — change theme, hero or layout.',
    );
    process.exit(1);
  }
}

runCli(main);
