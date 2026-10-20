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
import { isAllowedImageUrl, type Spec, type SpecImage } from './schema';

/**
 * Where each image of a generated template comes from: a placeholder (default), a local file, a
 * public photo URL from an allowed host (downloaded once, no API key) or a Pixabay search
 * (`--images pixabay`, needs PIXABAY_API_KEY). Real photos already in the folder are never overwritten: the
 * credits file records the hash of what the build wrote, and anything else is hand-placed.
 */

export type ImageMode = 'placeholder' | 'none' | 'pixabay';

export const IMAGE_MODES: readonly ImageMode[] = [
  'placeholder',
  'none',
  'pixabay',
];

export interface ImageCredit {
  file: string;
  /** `pexels` is read-only (legacy CREDITS.json); new stock photos are `pixabay`. */
  source: 'placeholder' | 'pexels' | 'pixabay' | 'file' | 'url';
  sha256: string;
  query?: string;
  providerId?: number;
  pageUrl?: string;
  photographer?: string;
  photographerUrl?: string;
  tags?: string;
  /** Legacy Pexels fields, kept so old CREDITS.json still parse. */
  pexelsId?: number;
  pexelsUrl?: string;
  path?: string;
  /** `url` source: what the spec pasted, and the photo's page when the host has one (Pexels). */
  url?: string;
}

export interface CreditsFile {
  images: ImageCredit[];
}

export const CREDITS_FILE = 'CREDITS.json';

const PIXABAY_DOWNLOAD_HOSTS = new Set(['pixabay.com', 'cdn.pixabay.com']);
const SEARCH_TTL_MS = 24 * 60 * 60 * 1000;
const SEARCH_GAP_MS = 700;
const DEFAULT_CACHE = resolve(REPO_ROOT, '.lattiz/cache/pixabay');

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

/** PIXABAY_API_KEY from the shell, ./.env or apps/api/.env. Never logged. */
export function pixabayKey(): { key: string; origin: string } | null {
  if (process.env.PIXABAY_API_KEY?.trim())
    return { key: process.env.PIXABAY_API_KEY.trim(), origin: 'shell' };
  if (process.env.VITEST) return null; // tests: env only; never open .env*
  for (const rel of ['.env', 'apps/api/.env']) {
    const file = resolve(REPO_ROOT, rel);
    if (!existsSync(file)) continue;
    const value = parseEnv(readFileSync(file, 'utf8')).PIXABAY_API_KEY?.trim();
    if (value) return { key: value, origin: rel };
  }
  return null;
}

export function resolveImageMode(
  flag: string | undefined,
  opts: { defaultPixabayIfKey?: boolean } = {},
): { mode: ImageMode; note: string } {
  if (flag === 'pexels')
    throw new Error('Pexels ya no se usa; usa --images pixabay');
  if (flag) {
    if (!(IMAGE_MODES as readonly string[]).includes(flag))
      throw new Error(
        `--images inválido: "${flag}". Opciones: ${IMAGE_MODES.join(', ')}`,
      );
    const mode = flag as ImageMode;
    const note =
      mode === 'pixabay'
        ? 'fotos: Pixabay (--images pixabay)'
        : mode === 'none'
          ? 'fotos: ninguna (--images none)'
          : 'fotos: placeholders (--images placeholder)';
    return { mode, note };
  }
  const found = pixabayKey();
  if (opts.defaultPixabayIfKey !== false && found)
    return {
      mode: 'pixabay',
      note: `fotos: Pixabay (PIXABAY_API_KEY presente en ${found.origin})`,
    };
  return {
    mode: 'placeholder',
    note: found
      ? 'fotos: placeholders'
      : 'fotos: placeholders (no hay PIXABAY_API_KEY; pasa --images pixabay cuando la tengas)',
  };
}

export interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  user_id: number;
  userURL: string;
  isAiGenerated?: boolean;
  isLowQuality?: boolean;
}

interface SearchCache {
  fetchedAt: number;
  hits: PixabayHit[];
}

const cacheKey = (text: string) =>
  createHash('sha256').update(text).digest('hex').slice(0, 16);

function pixabayOrientation(
  orientation: GiroImage['orientation'],
): 'horizontal' | 'vertical' | 'all' {
  if (orientation === 'portrait') return 'vertical';
  if (orientation === 'square') return 'all';
  return 'horizontal';
}

export function usablePixabayHits(hits: PixabayHit[]): PixabayHit[] {
  return hits.filter((h) => !h.isAiGenerated && !h.isLowQuality);
}

let lastCall = 0;
async function searchOnce(
  query: string,
  orientation: GiroImage['orientation'],
  key: string,
  minWidth: number | undefined,
  cacheDir: string,
): Promise<PixabayHit[]> {
  const file = resolve(
    cacheDir,
    `search-${cacheKey(`${query}|${orientation}|${minWidth ?? ''}`)}.json`,
  );
  if (existsSync(file)) {
    try {
      const cached = JSON.parse(readFileSync(file, 'utf8')) as SearchCache;
      if (
        typeof cached.fetchedAt === 'number' &&
        Date.now() - cached.fetchedAt < SEARCH_TTL_MS &&
        Array.isArray(cached.hits)
      )
        return cached.hits;
    } catch {
      // stale or corrupt cache: fetch again
    }
  }
  const gap = process.env.VITEST ? 0 : SEARCH_GAP_MS;
  const wait = lastCall + gap - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
  const params = new URLSearchParams({
    key,
    q: query,
    lang: 'en',
    image_type: 'photo',
    orientation: pixabayOrientation(orientation),
    safesearch: 'true',
    per_page: '20',
  });
  if (minWidth && minWidth > 0) params.set('min_width', String(minWidth));
  const res = await fetch(`https://pixabay.com/api/?${params}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 429)
    throw new Error(
      'límite de Pixabay alcanzado (100 por 60 s); lo descargado queda en .lattiz/cache/pixabay, reintenta más tarde',
    );
  if (!res.ok) throw new Error(`Pixabay respondió ${res.status} a "${query}"`);
  const body = (await res.json()) as { hits?: PixabayHit[] };
  const hits = Array.isArray(body.hits) ? body.hits : [];
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(
    file,
    JSON.stringify({ fetchedAt: Date.now(), hits } satisfies SearchCache),
  );
  return hits;
}

export async function pixabaySearch(
  query: string,
  orientation: GiroImage['orientation'],
  key: string,
  minWidth?: number,
  cacheDir: string = DEFAULT_CACHE,
): Promise<PixabayHit[]> {
  const hits = await searchOnce(query, orientation, key, minWidth, cacheDir);
  if (hits.length === 0 && minWidth != null)
    return searchOnce(query, orientation, key, undefined, cacheDir);
  return hits;
}

function assertPixabayDownloadUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('images: URL de Pixabay inválida');
  }
  if (
    parsed.protocol !== 'https:' ||
    !PIXABAY_DOWNLOAD_HOSTS.has(parsed.hostname)
  )
    throw new Error('images: la foto de Pixabay no está en un host permitido');
  return parsed;
}

async function fetchPixabayAsset(raw: string): Promise<Buffer> {
  let current = assertPixabayDownloadUrl(raw).toString();
  for (let hop = 0; hop < 5; hop += 1) {
    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(60_000),
    });
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      current = assertPixabayDownloadUrl(
        new URL(loc, current).toString(),
      ).toString();
      continue;
    }
    if (!res.ok)
      throw new Error(`no pude descargar la foto de Pixabay (${res.status})`);
    if (!/^image\//.test(res.headers.get('content-type') ?? ''))
      throw new Error('images: la descarga de Pixabay no es una imagen');
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > MAX_DOWNLOAD_BYTES)
      throw new Error('images: la foto de Pixabay pesa más de 15 MB');
    return buffer;
  }
  throw new Error('images: demasiadas redirecciones en la foto de Pixabay');
}

export async function pixabayDownload(
  hit: PixabayHit,
  cacheDir: string = DEFAULT_CACHE,
): Promise<Buffer> {
  const file = resolve(cacheDir, `${hit.id}.jpg`);
  if (existsSync(file)) return readFileSync(file);
  const buffer = await fetchPixabayAsset(hit.largeImageURL);
  mkdirSync(cacheDir, { recursive: true });
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

export function imageSearchQuery(
  source: SpecImage['source'] | undefined,
): string | undefined {
  if (!source || typeof source !== 'object') return undefined;
  if ('search' in source) return source.search;
  if ('pexels' in source) return source.pexels;
  return undefined;
}

function pickHit(
  hits: PixabayHit[],
  used: Set<number>,
  width: number,
  height: number,
): PixabayHit | undefined {
  const unused = usablePixabayHits(hits).filter((h) => !used.has(h.id));
  const pool = unused.slice(0, 5);
  if (pool.length === 0) return undefined;
  const target = width / height;
  let best = pool[0];
  let bestDelta = Infinity;
  for (const h of pool) {
    const ratio =
      h.imageWidth > 0 && h.imageHeight > 0
        ? h.imageWidth / h.imageHeight
        : target;
    const delta = Math.abs(ratio - target);
    if (delta < bestDelta) {
      best = h;
      bestDelta = delta;
    }
  }
  return best;
}

function isStockSource(
  source: ImageCredit['source'] | undefined,
): source is 'pixabay' | 'pexels' {
  return source === 'pixabay' || source === 'pexels';
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
  cacheDir?: string;
}): Promise<ImagePlanResult> {
  const { spec, giro, mode, jobs, kitDir, tempDir } = opts;
  const cacheDir = opts.cacheDir ?? DEFAULT_CACHE;
  const previous = new Map(readCredits(kitDir).images.map((c) => [c.file, c]));
  const credits: ImageCredit[] = [];
  const notes: string[] = [];
  const used = new Set<number>();
  const key = mode === 'pixabay' ? pixabayKey() : null;
  if (mode === 'pixabay' && !key)
    throw new Error(
      'falta PIXABAY_API_KEY (en la terminal, .env o apps/api/.env); usa --images placeholder',
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
      imageSearchQuery(specImage?.source) ?? giro.images[imageKey]?.query;
    const wantsPhoto = specImage?.source !== 'placeholder' && Boolean(query);
    const priorStock =
      isStockSource(prior?.source) && wantsPhoto && existsSync(kitFile);
    // A photo from an earlier stock run stays until the spec asks for something else.
    if (mode !== 'pixabay' && priorStock && prior) {
      copyFileSync(kitFile, tempFile);
      credits.push(prior);
      const id = prior.providerId ?? prior.pexelsId;
      if (id) used.add(id);
      continue;
    }
    if (mode === 'pixabay' && wantsPhoto && key) {
      if (priorStock && prior?.query === query && prior) {
        copyFileSync(kitFile, tempFile);
        credits.push(prior);
        const id = prior.providerId ?? prior.pexelsId;
        if (id) used.add(id);
        continue;
      }
      const orientation =
        specImage?.orientation ??
        giro.images[imageKey]?.orientation ??
        'landscape';
      const hits = await pixabaySearch(
        query as string,
        orientation,
        key.key,
        job.width,
        cacheDir,
      );
      const hit = pickHit(hits, used, job.width, job.height);
      if (!hit) {
        notes.push(
          `${job.name}: Pixabay no devolvió fotos para "${query}"; queda el placeholder`,
        );
      } else {
        used.add(hit.id);
        mkdirSync(dirname(tempFile), { recursive: true });
        writeFileSync(
          tempFile,
          await fit(await pixabayDownload(hit, cacheDir)),
        );
        const tags = [
          ...new Set(
            (hit.tags ?? '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ].join(', ');
        credits.push({
          file: job.name,
          source: 'pixabay',
          sha256: sha256File(tempFile),
          query,
          providerId: hit.id,
          pageUrl: hit.pageURL,
          photographer: hit.user,
          ...(hit.userURL ? { photographerUrl: hit.userURL } : {}),
          ...(tags ? { tags } : {}),
        });
        notes.push(
          `${job.name} ← Pixabay #${hit.id}${tags ? ` «${tags}»` : ''}`,
        );
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
