import { Logger } from '@nestjs/common';
import type {
  StockPhoto,
  StockPhotoProviderPort,
  StockQuota,
  StockSearchPage,
} from '../domain/stock-photo-provider.port';
import { StockProviderUnavailableException } from '../stock.exceptions';

const API_BASE = 'https://pixabay.com/api/';
const REQUEST_TIMEOUT_MS = 10_000;
const NUMERIC_ID = /^\d+$/;

export const PIXABAY_IMAGE_HOSTS: ReadonlySet<string> = new Set([
  'pixabay.com',
  'cdn.pixabay.com',
]);

interface PixabayHit {
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

interface PixabaySearchResponse {
  total: number;
  totalHits: number;
  hits: PixabayHit[];
}

/** Only https URLs on pixabay.com or cdn.pixabay.com ever leave this adapter. */
function isPixabayImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && PIXABAY_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function altFromTags(tags: string): string {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const raw of tags.split(',')) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(tag);
    if (unique.length === 3) break;
  }
  return unique.join(', ');
}

function photographerPage(hit: PixabayHit): string {
  if (hit.userURL && isPixabayImageUrl(hit.userURL)) return hit.userURL;
  return `https://pixabay.com/users/${encodeURIComponent(hit.user)}-${hit.user_id}/`;
}

function toStockPhoto(hit: PixabayHit): StockPhoto | null {
  const thumbUrl = hit.webformatURL.replace('_640.', '_340.');
  const photographerUrl = photographerPage(hit);
  if (
    !isPixabayImageUrl(hit.largeImageURL) ||
    !isPixabayImageUrl(thumbUrl) ||
    !isPixabayImageUrl(hit.pageURL) ||
    !isPixabayImageUrl(photographerUrl)
  ) {
    return null;
  }
  const downloadUrl = hit.largeImageURL;
  return {
    id: String(hit.id),
    width: hit.imageWidth,
    height: hit.imageHeight,
    alt: altFromTags(hit.tags ?? ''),
    avgColor: null,
    photographer: hit.user,
    photographerUrl,
    pageUrl: hit.pageURL,
    thumbUrl,
    downloadUrl: () => downloadUrl,
  };
}

function isRejectedHit(hit: PixabayHit): boolean {
  return hit.isAiGenerated === true || hit.isLowQuality === true;
}

function redactKey(message: string): string {
  return message.replace(/([?&]key=)[^&\s]+/gi, '$1');
}

export class PixabayStockPhotoAdapter implements StockPhotoProviderPort {
  private readonly logger = new Logger(PixabayStockPhotoAdapter.name);
  private lastQuota: StockQuota | null = null;

  constructor(private readonly apiKey: string | undefined) {}

  get enabled(): boolean {
    return !!this.apiKey;
  }

  quota(): StockQuota | null {
    return this.lastQuota;
  }

  async search(
    query: string,
    page: number,
    perPage: number,
  ): Promise<StockSearchPage> {
    const per = Math.min(200, Math.max(3, perPage));
    const params = new URLSearchParams({
      q: query,
      lang: 'es',
      image_type: 'photo',
      safesearch: 'true',
      per_page: String(per),
      page: String(page),
    });
    const body = await this.get(params);
    if (!body || !Array.isArray(body.hits)) {
      throw new StockProviderUnavailableException();
    }
    return {
      photos: body.hits.flatMap((hit) => {
        if (isRejectedHit(hit)) return [];
        return toStockPhoto(hit) ?? [];
      }),
      page,
      perPage: per,
      totalResults: body.totalHits,
      hasNext: page * per < body.totalHits,
    };
  }

  async getPhoto(id: string): Promise<StockPhoto | null> {
    if (!NUMERIC_ID.test(id)) return null;
    const body = await this.get(new URLSearchParams({ id }), {
      notFoundOn400: true,
    });
    const hit = body?.hits?.[0];
    if (!hit || isRejectedHit(hit)) return null;
    return toStockPhoto(hit);
  }

  /** Null on 400 lookup-by-id; throws StockProviderUnavailableException otherwise. */
  private async get(
    params: URLSearchParams,
    options: { notFoundOn400?: boolean } = {},
  ): Promise<PixabaySearchResponse | null> {
    if (!this.apiKey) throw new StockProviderUnavailableException();
    params.set('key', this.apiKey);
    let res: Response;
    try {
      res = await fetch(`${API_BASE}?${params}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(
        `Pixabay request failed: ${redactKey((error as Error).message)}`,
      );
      throw new StockProviderUnavailableException();
    }
    this.recordQuota(res.headers);
    if (options.notFoundOn400 && res.status === 400) return null;
    if (!res.ok) {
      this.logger.warn(`Pixabay answered HTTP ${res.status}`);
      throw new StockProviderUnavailableException();
    }
    return (await res.json()) as PixabaySearchResponse;
  }

  private recordQuota(headers: Headers): void {
    const limit = Number(headers.get('x-ratelimit-limit'));
    const remaining = Number(headers.get('x-ratelimit-remaining'));
    const reset = Number(headers.get('x-ratelimit-reset'));
    if (
      ![limit, remaining, reset].every(Number.isFinite) ||
      !headers.has('x-ratelimit-remaining')
    ) {
      return;
    }
    this.lastQuota = {
      limit,
      remaining,
      resetAt: Date.now() + reset * 1000,
    };
  }
}
