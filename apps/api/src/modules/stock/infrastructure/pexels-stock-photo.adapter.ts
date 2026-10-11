import { Logger } from '@nestjs/common';
import type {
  StockPhoto,
  StockPhotoProviderPort,
  StockQuota,
  StockSearchPage,
} from '../domain/stock-photo-provider.port';
import { StockProviderUnavailableException } from '../stock.exceptions';

const API_BASE = 'https://api.pexels.com/v1';
const REQUEST_TIMEOUT_MS = 10_000;
export const PEXELS_IMAGE_HOST = 'images.pexels.com';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  alt: string | null;
  avg_color: string | null;
  photographer: string;
  photographer_url: string;
  src: { original: string; medium: string };
}

interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  photos: PexelsPhoto[];
}

/** Only https URLs on the Pexels image CDN ever leave this adapter as download sources. */
function isPexelsImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === PEXELS_IMAGE_HOST;
  } catch {
    return false;
  }
}

function toStockPhoto(photo: PexelsPhoto): StockPhoto | null {
  if (!isPexelsImageUrl(photo.src.original)) return null;
  const original = photo.src.original.split('?')[0];
  return {
    id: String(photo.id),
    width: photo.width,
    height: photo.height,
    alt: photo.alt ?? '',
    avgColor: photo.avg_color,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    pageUrl: photo.url,
    thumbUrl: isPexelsImageUrl(photo.src.medium)
      ? photo.src.medium
      : `${original}?auto=compress&cs=tinysrgb&h=350`,
    // Pexels resizes on its CDN, so the import never downloads the full original.
    downloadUrl: (max) =>
      `${original}?auto=compress&cs=tinysrgb&w=${max}&h=${max}`,
  };
}

export class PexelsStockPhotoAdapter implements StockPhotoProviderPort {
  private readonly logger = new Logger(PexelsStockPhotoAdapter.name);
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
    const params = new URLSearchParams({
      query,
      page: String(page),
      per_page: String(perPage),
      locale: 'es-ES',
    });
    const body = await this.get<PexelsSearchResponse>(`/search?${params}`);
    if (!body || !Array.isArray(body.photos)) {
      throw new StockProviderUnavailableException();
    }
    return {
      photos: body.photos.flatMap((p) => toStockPhoto(p) ?? []),
      page: body.page,
      perPage: body.per_page,
      totalResults: body.total_results,
      hasNext: !!body.next_page,
    };
  }

  async getPhoto(id: string): Promise<StockPhoto | null> {
    const photo = await this.get<PexelsPhoto>(
      `/photos/${encodeURIComponent(id)}`,
    );
    return photo ? toStockPhoto(photo) : null;
  }

  /** Null on 404; throws StockProviderUnavailableException on anything else unexpected. */
  private async get<T>(path: string): Promise<T | null> {
    if (!this.apiKey) throw new StockProviderUnavailableException();
    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        headers: { Authorization: this.apiKey },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Pexels request failed: ${(error as Error).message}`);
      throw new StockProviderUnavailableException();
    }
    this.recordQuota(res.headers);
    if (res.status === 404) return null;
    if (!res.ok) {
      this.logger.warn(
        `Pexels answered HTTP ${res.status} for ${path.split('?')[0]}`,
      );
      throw new StockProviderUnavailableException();
    }
    return (await res.json()) as T;
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
    this.lastQuota = { limit, remaining, resetAt: reset * 1000 };
  }
}
