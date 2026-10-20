import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { Logger } from '@nestjs/common';
import { StockProviderUnavailableException } from '../stock.exceptions';
import {
  PIXABAY_IMAGE_HOSTS,
  PixabayStockPhotoAdapter,
} from './pixabay-stock-photo.adapter';

const API_KEY = 'test-pixabay-key';

interface PixabayHitFixture {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  user_id: number;
  userURL?: string;
  isAiGenerated?: boolean;
  isLowQuality?: boolean;
}

function hit(
  overrides: Partial<PixabayHitFixture> = {},
): PixabayHitFixture {
  return {
    id: 123,
    pageURL: 'https://pixabay.com/photos/flower-123/',
    tags: 'flower, yellow, flower, wallpaper, extra',
    previewURL: 'https://cdn.pixabay.com/photo/preview.jpg',
    webformatURL: 'https://pixabay.com/get/abc_640.jpg',
    webformatWidth: 640,
    webformatHeight: 426,
    largeImageURL: 'https://pixabay.com/get/abc_1280.jpg',
    imageWidth: 4000,
    imageHeight: 2667,
    user: 'alice',
    user_id: 99,
    userURL: 'https://pixabay.com/users/alice-99/',
    isAiGenerated: false,
    isLowQuality: false,
    ...overrides,
  };
}

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

describe('PixabayStockPhotoAdapter', () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = Logger.prototype.warn;
  const originalNow = Date.now;
  const logs: string[] = [];
  const fetched: string[] = [];

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Logger.prototype.warn = originalWarn;
    Date.now = originalNow;
    logs.length = 0;
    fetched.length = 0;
  });

  function captureLogs(): void {
    Logger.prototype.warn = (message?: unknown) => {
      logs.push(String(message));
    };
  }

  function mockFetch(
    handler: (url: string) => Response | Promise<Response>,
  ): void {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      fetched.push(url);
      return handler(url);
    }) as typeof fetch;
  }

  it('maps hit fields onto StockPhoto', async () => {
    mockFetch(() =>
      jsonResponse({
        total: 80,
        totalHits: 80,
        hits: [hit()],
      }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    const page = await adapter.search('flor', 1, 24);
    assert.equal(page.photos.length, 1);
    const photo = page.photos[0];
    assert.equal(photo.id, '123');
    assert.equal(photo.width, 4000);
    assert.equal(photo.height, 2667);
    assert.equal(photo.alt, 'flower, yellow, wallpaper');
    assert.equal(photo.avgColor, null);
    assert.equal(photo.photographer, 'alice');
    assert.equal(photo.photographerUrl, 'https://pixabay.com/users/alice-99/');
    assert.equal(photo.pageUrl, 'https://pixabay.com/photos/flower-123/');
    assert.equal(photo.thumbUrl, 'https://pixabay.com/get/abc_340.jpg');
    assert.equal(photo.downloadUrl(1280), 'https://pixabay.com/get/abc_1280.jpg');
    assert.equal(fetched.length, 1);
    const called = new URL(fetched[0]);
    assert.equal(called.origin + called.pathname, 'https://pixabay.com/api/');
    assert.equal(called.searchParams.get('q'), 'flor');
    assert.equal(called.searchParams.get('lang'), 'es');
    assert.equal(called.searchParams.get('image_type'), 'photo');
    assert.equal(called.searchParams.get('safesearch'), 'true');
    assert.equal(called.searchParams.get('per_page'), '24');
    assert.equal(called.searchParams.get('page'), '1');
    assert.equal(called.searchParams.get('key'), API_KEY);
  });

  it('builds photographerUrl when userURL is missing', async () => {
    mockFetch(() =>
      jsonResponse({
        total: 1,
        totalHits: 1,
        hits: [hit({ userURL: undefined })],
      }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    const page = await adapter.search('flor', 1, 3);
    assert.equal(
      page.photos[0].photographerUrl,
      'https://pixabay.com/users/alice-99/',
    );
  });

  it('clamps per_page to a minimum of 3', async () => {
    mockFetch(() =>
      jsonResponse({ total: 3, totalHits: 3, hits: [hit()] }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    const page = await adapter.search('flor', 1, 1);
    assert.equal(page.perPage, 3);
    assert.equal(new URL(fetched[0]).searchParams.get('per_page'), '3');
  });

  it('drops AI-generated and low-quality hits', async () => {
    mockFetch(() =>
      jsonResponse({
        total: 3,
        totalHits: 3,
        hits: [
          hit({ id: 1, isAiGenerated: true }),
          hit({ id: 2, isLowQuality: true }),
          hit({ id: 3 }),
        ],
      }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    const page = await adapter.search('flor', 1, 3);
    assert.deepEqual(
      page.photos.map((photo) => photo.id),
      ['3'],
    );
  });

  it('filters hits whose image URLs are not on Pixabay hosts', async () => {
    mockFetch(() =>
      jsonResponse({
        total: 2,
        totalHits: 2,
        hits: [
          hit({
            id: 1,
            largeImageURL: 'https://evil.example/abc_1280.jpg',
          }),
          hit({ id: 2 }),
        ],
      }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    const page = await adapter.search('flor', 1, 3);
    assert.deepEqual(
      page.photos.map((photo) => photo.id),
      ['2'],
    );
    assert.ok(PIXABAY_IMAGE_HOSTS.has('pixabay.com'));
    assert.ok(PIXABAY_IMAGE_HOSTS.has('cdn.pixabay.com'));
  });

  it('sets hasNext from page * perPage < totalHits', async () => {
    mockFetch(() =>
      jsonResponse({ total: 500, totalHits: 500, hits: [hit()] }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    const first = await adapter.search('flor', 1, 24);
    assert.equal(first.totalResults, 500);
    assert.equal(first.hasNext, true);

    const last = await adapter.search('flor', 21, 24);
    assert.equal(last.hasNext, false);
  });

  it('records quota from rate-limit headers as seconds until reset', async () => {
    const now = 1_700_000_000_000;
    Date.now = () => now;
    mockFetch(() =>
      jsonResponse(
        { total: 1, totalHits: 1, hits: [hit()] },
        {
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '87',
            'X-RateLimit-Reset': '42',
          },
        },
      ),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    await adapter.search('flor', 1, 3);
    assert.deepEqual(adapter.quota(), {
      limit: 100,
      remaining: 87,
      resetAt: now + 42_000,
    });
  });

  it('looks up a photo by numeric id', async () => {
    mockFetch(() =>
      jsonResponse({ total: 1, totalHits: 1, hits: [hit()] }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    const photo = await adapter.getPhoto('123');
    assert.equal(photo?.id, '123');
    assert.equal(new URL(fetched[0]).searchParams.get('id'), '123');
  });

  it('returns null for a missing id (HTTP 400) without throwing', async () => {
    mockFetch(
      () =>
        new Response('[ERROR 400] Image #999 does not exist.', { status: 400 }),
    );
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    assert.equal(await adapter.getPhoto('999'), null);
  });

  it('returns null when lookup hits are empty', async () => {
    mockFetch(() => jsonResponse({ total: 0, totalHits: 0, hits: [] }));
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    assert.equal(await adapter.getPhoto('123'), null);
  });

  it('returns null for a non-numeric id without calling Pixabay', async () => {
    mockFetch(() => {
      throw new Error('fetch should not run');
    });
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    assert.equal(await adapter.getPhoto('abc'), null);
    assert.equal(fetched.length, 0);
  });

  it('throws StockProviderUnavailableException on HTTP 500', async () => {
    captureLogs();
    mockFetch(() => jsonResponse({ message: 'boom' }, { status: 500 }));
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    await assert.rejects(
      () => adapter.search('flor', 1, 3),
      (error: unknown) => {
        assert.ok(error instanceof StockProviderUnavailableException);
        return true;
      },
    );
    assert.match(logs.join('\n'), /HTTP 500/);
    assert.equal(
      logs.some((line) => line.includes(API_KEY)),
      false,
    );
  });

  it('is disabled when the API key is missing', () => {
    const adapter = new PixabayStockPhotoAdapter(undefined);
    assert.equal(adapter.enabled, false);
  });

  it('never logs the API key, even when fetch throws the URL', async () => {
    captureLogs();
    mockFetch((url) => {
      throw new Error(`network failed for ${url}`);
    });
    const adapter = new PixabayStockPhotoAdapter(API_KEY);
    await assert.rejects(
      () => adapter.search('flor', 1, 3),
      (error: unknown) => {
        assert.ok(error instanceof StockProviderUnavailableException);
        return true;
      },
    );
    const combined = logs.join('\n');
    assert.equal(combined.includes(API_KEY), false);
    assert.match(combined, /Pixabay request failed/);
    assert.equal(fetched.length, 1);
    assert.ok(fetched[0].includes(API_KEY));
  });
});
