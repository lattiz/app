import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { GiroDefinition, GiroImage } from '../src/spec/giro';
import {
  CREDITS_FILE,
  imageSearchQuery,
  pixabaySearch,
  resolveImageMode,
  sha256File,
  sourceImages,
  usablePixabayHits,
  type ImageCredit,
  type PixabayHit,
} from '../src/spec/images';
import { parseSpec, type Spec } from '../src/spec/schema';

const FAKE_KEY = 'test-pixabay-key-not-for-api';

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function hostPath(
  input: RequestInfo | URL,
): { host: string; path: string } | null {
  try {
    const u = new URL(urlOf(input));
    return { host: u.hostname, path: u.pathname };
  } catch {
    return null;
  }
}

function hit(id: number, extra: Partial<PixabayHit> = {}): PixabayHit {
  return {
    id,
    pageURL: `https://pixabay.com/photos/x-${id}/`,
    tags: 'barber, fade',
    largeImageURL: `https://cdn.pixabay.com/photo/${id}.jpg`,
    imageWidth: 2000,
    imageHeight: 1333,
    user: 'Ana',
    user_id: 1,
    userURL: 'https://pixabay.com/users/ana-1/',
    ...extra,
  };
}

function giroFor(images: Record<string, GiroImage>): GiroDefinition {
  return { id: 'barberia', images } as GiroDefinition;
}

function specWith(images: NonNullable<Spec['images']>): Spec {
  return {
    specVersion: 1,
    id: 'barberia-pixabay-v1',
    tier: 'pro',
    giro: 'barberia',
    business: { name: 'Pixabay Test' },
    images,
  };
}

function leak(...chunks: unknown[]): boolean {
  return chunks.some((c) => {
    const text = typeof c === 'string' ? c : JSON.stringify(c);
    return text.includes(FAKE_KEY);
  });
}

describe('Pixabay image sourcing', () => {
  let jpegBytes: Buffer;
  let tmp: string;
  let previousKey: string | undefined;
  let apiHits = 0;
  let assetHits = 0;
  let hitsForSearch: PixabayHit[] = [];

  beforeAll(async () => {
    jpegBytes = await sharp({
      create: {
        width: 80,
        height: 60,
        channels: 3,
        background: { r: 12, g: 64, b: 96 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  beforeEach(() => {
    previousKey = process.env.PIXABAY_API_KEY;
    process.env.PIXABAY_API_KEY = FAKE_KEY;
    apiHits = 0;
    assetHits = 0;
    hitsForSearch = [hit(101)];
    tmp = mkdtempSync(join(tmpdir(), 'lz-pixabay-'));
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const loc = hostPath(input);
        if (!loc) return new Response('bad url', { status: 400 });
        if (loc.host === 'pixabay.com' && loc.path.startsWith('/api')) {
          apiHits += 1;
          return new Response(JSON.stringify({ hits: hitsForSearch }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        if (loc.host === 'cdn.pixabay.com' || loc.host === 'pixabay.com') {
          assetHits += 1;
          return new Response(new Uint8Array(jpegBytes), {
            status: 200,
            headers: { 'content-type': 'image/jpeg' },
          });
        }
        return new Response('no', { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rmSync(tmp, { recursive: true, force: true });
    if (previousKey === undefined) delete process.env.PIXABAY_API_KEY;
    else process.env.PIXABAY_API_KEY = previousKey;
  });

  const dirs = () => {
    const cacheDir = resolve(tmp, 'cache');
    const kitDir = resolve(tmp, 'kit');
    const tempDir = resolve(tmp, 'temp');
    mkdirSync(cacheDir, { recursive: true });
    mkdirSync(kitDir, { recursive: true });
    mkdirSync(tempDir, { recursive: true });
    return { cacheDir, kitDir, tempDir };
  };

  async function run(opts: {
    images?: NonNullable<Spec['images']>;
    giroImages?: Record<string, GiroImage>;
    jobs?: { name: string; width: number; height: number }[];
    kitDir?: string;
    tempDir?: string;
    cacheDir?: string;
  } = {}) {
    const base = dirs();
    const kitDir = opts.kitDir ?? base.kitDir;
    const tempDir = opts.tempDir ?? base.tempDir;
    const cacheDir = opts.cacheDir ?? base.cacheDir;
    mkdirSync(kitDir, { recursive: true });
    mkdirSync(tempDir, { recursive: true });
    return sourceImages({
      spec: specWith(
        opts.images ?? [{ key: 'hero', source: { search: 'barber shop' } }],
      ),
      specDir: tmp,
      giro: giroFor(
        opts.giroImages ?? {
          hero: { query: 'barber shop', orientation: 'landscape' },
        },
      ),
      mode: 'pixabay',
      jobs: opts.jobs ?? [{ name: 'hero.jpg', width: 1600, height: 900 }],
      kitDir,
      tempDir,
      cacheDir,
    });
  }

  it('searches, downloads and credits a Pixabay photo with tags in the notes', async () => {
    const { tempDir } = dirs();
    const result = await run({ tempDir });
    expect(apiHits).toBe(1);
    expect(assetHits).toBe(1);
    expect(existsSync(resolve(tempDir, 'hero.jpg'))).toBe(true);
    expect(result.credits).toEqual([
      expect.objectContaining({
        file: 'hero.jpg',
        source: 'pixabay',
        query: 'barber shop',
        providerId: 101,
        photographer: 'Ana',
        tags: 'barber, fade',
      }),
    ]);
    expect(result.notes.some((n) => n.includes('barber, fade'))).toBe(true);
    expect(result.notes.some((n) => n.includes('#101'))).toBe(true);
    expect(leak(result.notes, result.credits)).toBe(false);
  });

  it('reuses the 24 h search cache on the second call', async () => {
    const { cacheDir } = dirs();
    const first = await pixabaySearch(
      'barber shop',
      'landscape',
      FAKE_KEY,
      1600,
      cacheDir,
    );
    const second = await pixabaySearch(
      'barber shop',
      'landscape',
      FAKE_KEY,
      1600,
      cacheDir,
    );
    expect(first).toEqual(second);
    expect(apiHits).toBe(1);
    expect(assetHits).toBe(0);
    expect(leak(JSON.stringify(first))).toBe(false);
  });

  it('drops AI-generated and low-quality hits', async () => {
    hitsForSearch = [
      hit(1, { isAiGenerated: true, tags: 'ai studio' }),
      hit(2, { isLowQuality: true, tags: 'blurry' }),
      hit(3, { tags: 'real fade' }),
    ];
    expect(usablePixabayHits(hitsForSearch).map((h) => h.id)).toEqual([3]);
    const result = await run();
    expect(result.credits[0]?.providerId).toBe(3);
    expect(result.notes.some((n) => n.includes('real fade'))).toBe(true);
    expect(result.notes.some((n) => n.includes('ai studio'))).toBe(false);
    expect(leak(result.notes, result.credits)).toBe(false);
  });

  it('does not reuse a photo already in `used`', async () => {
    hitsForSearch = [
      hit(11, { imageWidth: 1600, imageHeight: 900, tags: 'shop' }),
      hit(22, { imageWidth: 800, imageHeight: 1000, tags: 'portrait' }),
    ];
    const result = await run({
      images: [
        { key: 'hero', source: { search: 'barber shop' } },
        { key: 'about', source: { search: 'barber shop' } },
      ],
      giroImages: {
        hero: { query: 'barber shop', orientation: 'landscape' },
        about: { query: 'barber shop', orientation: 'portrait' },
      },
      jobs: [
        { name: 'hero.jpg', width: 1600, height: 900 },
        { name: 'about.jpg', width: 800, height: 1000 },
      ],
    });
    const ids = result.credits.map((c) => c.providerId).sort();
    expect(ids).toEqual([11, 22]);
    expect(leak(result.notes, result.credits)).toBe(false);
  });

  it('treats { pexels } as an alias of { search }', async () => {
    const parsed = parseSpec({
      specVersion: 1,
      id: 'barberia-alias-v1',
      tier: 'pro',
      giro: 'barberia',
      business: { name: 'Alias' },
      images: [{ key: 'hero', source: { pexels: 'vintage barber chair' } }],
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(imageSearchQuery(parsed.spec.images?.[0]?.source)).toBe(
      'vintage barber chair',
    );
    const result = await run({
      images: [{ key: 'hero', source: { pexels: 'vintage barber chair' } }],
    });
    expect(result.credits[0]?.source).toBe('pixabay');
    expect(result.credits[0]?.query).toBe('vintage barber chair');
    expect(apiHits).toBe(1);
    expect(leak(result.notes, result.credits, parsed)).toBe(false);
  });

  it('reuses a previous stock credit when the query is unchanged', async () => {
    const { kitDir, cacheDir, tempDir } = dirs();
    const hero = resolve(kitDir, 'hero.jpg');
    writeFileSync(hero, jpegBytes);
    const prior: ImageCredit = {
      file: 'hero.jpg',
      source: 'pixabay',
      sha256: sha256File(hero),
      query: 'barber shop',
      providerId: 77,
      pageUrl: 'https://pixabay.com/photos/x-77/',
      photographer: 'Ana',
      tags: 'barber, fade',
    };
    writeFileSync(
      resolve(kitDir, CREDITS_FILE),
      JSON.stringify({ images: [prior] }),
    );
    const result = await sourceImages({
      spec: specWith([{ key: 'hero', source: { search: 'barber shop' } }]),
      specDir: tmp,
      giro: giroFor({
        hero: { query: 'barber shop', orientation: 'landscape' },
      }),
      mode: 'pixabay',
      jobs: [{ name: 'hero.jpg', width: 1600, height: 900 }],
      kitDir,
      tempDir,
      cacheDir,
    });
    expect(apiHits).toBe(0);
    expect(assetHits).toBe(0);
    expect(result.credits[0]).toEqual(prior);
    expect(existsSync(resolve(tempDir, 'hero.jpg'))).toBe(true);
    expect(leak(result.notes, result.credits)).toBe(false);
  });

  it('never puts the API key in notes, errors or mode messages', async () => {
    const ok = await run();
    expect(leak(ok.notes, ok.credits)).toBe(false);

    const flagged = resolveImageMode('pixabay');
    const missing = (() => {
      delete process.env.PIXABAY_API_KEY;
      try {
        return resolveImageMode(undefined);
      } finally {
        process.env.PIXABAY_API_KEY = FAKE_KEY;
      }
    })();
    expect(flagged.mode).toBe('pixabay');
    expect(missing.mode).toBe('placeholder');
    expect(leak(flagged.note, missing.note)).toBe(false);

    let pexelsError = '';
    try {
      resolveImageMode('pexels');
    } catch (error) {
      pexelsError = (error as Error).message;
    }
    expect(pexelsError).toMatch(/Pexels ya no se usa/);
    expect(leak(pexelsError)).toBe(false);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('no', { status: 500 })),
    );
    let searchError = '';
    try {
      await pixabaySearch(
        'barber shop',
        'landscape',
        FAKE_KEY,
        undefined,
        resolve(tmp, 'cache-err'),
      );
    } catch (error) {
      searchError = (error as Error).message;
    }
    expect(searchError).toMatch(/Pixabay respondió 500/);
    expect(leak(searchError)).toBe(false);
  });
});
