import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import sharp from 'sharp';
import { REPO_ROOT } from '../lib/paths';
import type { GiroDefinition, GiroImage } from './giro';
import { isAllowedImageUrl, type Spec } from './schema';

/**
 * Where each image of a generated template comes from: a placeholder (default), a local file, a
 * public photo URL from an allowed host (downloaded once, no API key) or a Pexels search
 * (`--images pexels`, needs PEXELS_API_KEY). Real photos already in the folder are never overwritten: the
 * credits file records the hash of what the build wrote, and anything else is hand-placed.
 */

export type ImageMode = 'placeholder' | 'none' | 'pexels';

export interface ImageCredit {
  file: string;
  source: 'placeholder' | 'pexels' | 'file' | 'url';
  sha256: string;
  query?: string;
  pexelsId?: number;
  pexelsUrl?: string;
  photographer?: string;
  photographerUrl?: string;
  path?: string;
  /** `url` source: what the spec pasted, and the photo's page when the host has one (Pexels). */
  url?: string;
  pageUrl?: string;
}

export interface CreditsFile {
  images: ImageCredit[];
}

export const CREDITS_FILE = 'CREDITS.json';

export function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function readCredits(dir: string): CreditsFile {
  const file = resolve(dir, CREDITS_FILE);
  if (!existsSync(file)) return { images: [] };
  try {
    const json = JSON.parse(readFileSync(file, 'utf8')) as Partial<CreditsFile>;
    return { images: Array.isArray(json.images) ? json.images : [] };
  } catch {
    return { images: [] };
  }
}

/** PEXELS_API_KEY from the shell, ./.env or apps/api/.env (where the API's stock proxy keeps it). Never logged. */
export function pexelsKey(): { key: string; origin: string } | null {
  if (process.env.PEXELS_API_KEY?.trim())
    return { key: process.env.PEXELS_API_KEY.trim(), origin: 'shell' };
  for (const rel of ['.env', 'apps/api/.env']) {
    const file = resolve(REPO_ROOT, rel);
    if (!existsSync(file)) continue;
    const value = parseEnv(readFileSync(file, 'utf8')).PEXELS_API_KEY?.trim();
    if (value) return { key: value, origin: rel };
  }
  return null;
}

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: { original: string };
}

const CACHE = resolve(REPO_ROOT, '.lattiz/cache/pexels');
const cacheKey = (text: string) =>
  createHash('sha256').update(text).digest('hex').slice(0, 16);

let lastCall = 0;
async function pexelsSearch(
  query: string,
  orientation: GiroImage['orientation'],
  key: string,
): Promise<PexelsPhoto[]> {
  const file = resolve(
    CACHE,
    `search-${cacheKey(`${query}|${orientation}`)}.json`,
  );
  if (existsSync(file))
    return JSON.parse(readFileSync(file, 'utf8')) as PexelsPhoto[];
  // Pexels allows 200 requests/hour; space calls out and stop on 429.
  const wait = lastCall + 400 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  const url = `https://api.pexels.com/v1/search?${new URLSearchParams({
    query,
    orientation,
    per_page: '15',
    size: 'large',
  })}`;
  const res = await fetch(url, {
    headers: { Authorization: key },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 429)
    throw new Error(
      'límite de Pexels alcanzado (200 por hora); lo descargado queda en .lattiz/cache/pexels, reintenta más tarde',
    );
  if (!res.ok) throw new Error(`Pexels respondió ${res.status} a "${query}"`);
  const photos =
    ((await res.json()) as { photos?: PexelsPhoto[] }).photos ?? [];
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(file, JSON.stringify(photos));
  return photos;
}

async function pexelsDownload(photo: PexelsPhoto): Promise<Buffer> {
  const file = resolve(CACHE, `${photo.id}.jpg`);
  if (existsSync(file)) return readFileSync(file);
  const res = await fetch(
    `${photo.src.original}?auto=compress&cs=tinysrgb&w=2000`,
    {
      signal: AbortSignal.timeout(60_000),
    },
  );
  if (!res.ok)
    throw new Error(`no pude descargar la foto ${photo.id} (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(file, buffer);
  return buffer;
}

const URL_CACHE = resolve(REPO_ROOT, '.lattiz/cache/images');
const MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024;

/** Asks the CDN for a 2000 px rendition when it supports it; the seed converts to WebP ≤ 2000 px anyway. */
function sizedUrl(raw: string): string {
  const url = new URL(raw);
  if (url.hostname === 'images.pexels.com' && !url.search)
    url.search = '?auto=compress&cs=tinysrgb&w=2000';
  if (url.hostname === 'images.unsplash.com' && !url.searchParams.has('w')) {
    url.searchParams.set('w', '2000');
    url.searchParams.set('q', '85');
  }
  return url.toString();
}

/** The photo's page for the credits, when the URL says which photo it is. */
function photoPage(raw: string): string | undefined {
  const id = /^\/photos\/(\d+)\//.exec(new URL(raw).pathname)?.[1];
  return new URL(raw).hostname === 'images.pexels.com' && id
    ? `https://www.pexels.com/photo/${id}/`
    : undefined;
}

/** Downloads a pasted photo URL once (cached by URL), refusing other hosts, redirects off the list and non-images. */
async function downloadImageUrl(raw: string): Promise<Buffer> {
  if (!isAllowedImageUrl(raw))
    throw new Error(`images: URL no permitida (${raw})`);
  const file = resolve(URL_CACHE, `${cacheKey(raw)}.img`);
  if (existsSync(file)) return readFileSync(file);
  const res = await fetch(sizedUrl(raw), {
    signal: AbortSignal.timeout(60_000),
  });
  if (!isAllowedImageUrl(res.url))
    throw new Error(`images: ${raw} redirige a un host no permitido`);
  if (!res.ok)
    throw new Error(`images: no pude descargar ${raw} (${res.status})`);
  if (!/^image\//.test(res.headers.get('content-type') ?? ''))
    throw new Error(`images: ${raw} no es una imagen`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_DOWNLOAD_BYTES)
    throw new Error(`images: ${raw} pesa más de 15 MB`);
  mkdirSync(URL_CACHE, { recursive: true });
  writeFileSync(file, buffer);
  return buffer;
}

export interface ImageJob {
  /** `hero.jpg`, `gallery-03.jpg`… */
  name: string;
  width: number;
  height: number;
}

export interface ImagePlanResult {
  credits: ImageCredit[];
  notes: string[];
}

/**
 * Fills `tempDir` (assets/<giro>/<theme>/ of the scratch build) for one template. Placeholders the
 * compile already generated there stay unless a photo replaces them.
 */
export async function sourceImages(opts: {
  spec: Spec;
  specDir: string;
  giro: GiroDefinition;
  mode: ImageMode;
  jobs: ImageJob[];
  kitDir: string;
  tempDir: string;
  /** New templates only (A2 LCP policy): the hero photo at most this wide, at this JPEG quality. */
  hero?: { maxWidth: number; quality: number };
}): Promise<ImagePlanResult> {
  const { spec, giro, mode, jobs, kitDir, tempDir } = opts;
  const previous = new Map(readCredits(kitDir).images.map((c) => [c.file, c]));
  const credits: ImageCredit[] = [];
  const notes: string[] = [];
  const used = new Set<number>();
  const key = mode === 'pexels' ? pexelsKey() : null;
  if (mode === 'pexels' && !key)
    throw new Error(
      'falta PEXELS_API_KEY (en la terminal, .env o apps/api/.env); usa --images placeholder',
    );
  for (const job of jobs) {
    const imageKey = job.name.replace(/\.jpg$/, '');
    const kitFile = resolve(kitDir, job.name);
    const tempFile = resolve(tempDir, job.name);
    const prior = previous.get(job.name);
    const specImage = spec.images?.find((i) => i.key === imageKey);
    // The hero is the LCP image: new templates get it lighter (same crop, fewer pixels and bytes).
    const lcp = job.name === 'hero.jpg' ? opts.hero : undefined;
    const scale = lcp ? Math.min(1, lcp.maxWidth / job.width) : 1;
    const fit = async (input: Buffer | string) =>
      sharp(input)
        .rotate()
        .resize(Math.round(job.width * scale), Math.round(job.height * scale), {
          fit: 'cover',
          position: 'attention',
        })
        .jpeg({ quality: lcp?.quality ?? 80, mozjpeg: true })
        .toBuffer();

    // A file in the kit folder that the build didn't write is a real photo: keep it.
    if (
      existsSync(kitFile) &&
      (!prior || prior.sha256 !== sha256File(kitFile))
    ) {
      mkdirSync(dirname(tempFile), { recursive: true });
      copyFileSync(kitFile, tempFile);
      notes.push(
        `${job.name}: se conserva la foto que está en la carpeta (puesta a mano)`,
      );
      continue;
    }
    if (
      specImage &&
      typeof specImage.source === 'object' &&
      'file' in specImage.source
    ) {
      const from = resolve(opts.specDir, specImage.source.file);
      if (!existsSync(from))
        throw new Error(`images: no existe ${specImage.source.file}`);
      writeFileSync(tempFile, await fit(from));
      credits.push({
        file: job.name,
        source: 'file',
        sha256: sha256File(tempFile),
        path: specImage.source.file,
      });
      continue;
    }
    if (
      specImage &&
      typeof specImage.source === 'object' &&
      'url' in specImage.source
    ) {
      const url = specImage.source.url;
      writeFileSync(tempFile, await fit(await downloadImageUrl(url)));
      credits.push({
        file: job.name,
        source: 'url',
        sha256: sha256File(tempFile),
        url,
        ...(photoPage(url) ? { pageUrl: photoPage(url) } : {}),
      });
      continue;
    }
    const query =
      specImage &&
      typeof specImage.source === 'object' &&
      'pexels' in specImage.source
        ? specImage.source.pexels
        : giro.images[imageKey]?.query;
    const wantsPhoto = specImage?.source !== 'placeholder' && Boolean(query);
    // A photo from an earlier pexels run stays until the spec asks for something else.
    if (
      mode !== 'pexels' &&
      prior?.source === 'pexels' &&
      wantsPhoto &&
      existsSync(kitFile)
    ) {
      copyFileSync(kitFile, tempFile);
      credits.push(prior);
      continue;
    }
    if (mode === 'pexels' && wantsPhoto && key) {
      if (
        prior?.source === 'pexels' &&
        prior.query === query &&
        existsSync(kitFile)
      ) {
        copyFileSync(kitFile, tempFile);
        credits.push(prior);
        if (prior.pexelsId) used.add(prior.pexelsId);
        continue;
      }
      const orientation =
        specImage?.orientation ??
        giro.images[imageKey]?.orientation ??
        'landscape';
      const photos = await pexelsSearch(query as string, orientation, key.key);
      const photo = photos.find((p) => !used.has(p.id));
      if (!photo) {
        notes.push(
          `${job.name}: Pexels no devolvió fotos para "${query}"; queda el placeholder`,
        );
      } else {
        used.add(photo.id);
        writeFileSync(tempFile, await fit(await pexelsDownload(photo)));
        credits.push({
          file: job.name,
          source: 'pexels',
          sha256: sha256File(tempFile),
          query,
          pexelsId: photo.id,
          pexelsUrl: photo.url,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
        });
        continue;
      }
    }
    if (mode === 'none' && existsSync(kitFile)) {
      copyFileSync(kitFile, tempFile);
      if (prior) credits.push(prior);
      continue;
    }
    if (existsSync(tempFile))
      credits.push({
        file: job.name,
        source: 'placeholder',
        sha256: sha256File(tempFile),
      });
  }
  return { credits, notes };
}
