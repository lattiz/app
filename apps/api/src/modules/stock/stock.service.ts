import { createWriteStream } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { ImageOptimizer } from '../../common/images/image-optimizer';
import { type Database, DATABASE } from '../../database/database.module';
import type { UploadedAssetResponseDto } from '../sites/dto/sites.response.dto';
import { SitesService } from '../sites/sites.service';
import {
  STOCK_PHOTO_PROVIDER,
  type StockPhoto,
  type StockPhotoProviderPort,
} from './domain/stock-photo-provider.port';
import { PIXABAY_IMAGE_HOSTS } from './infrastructure/pixabay-stock-photo.adapter';
import { LruCache } from './lru-cache';
import {
  STOCK_MAX_PER_PAGE,
  type StockPhotoDto,
  type StockSearchResponseDto,
  type StockStatusDto,
} from './dto/stock.dto';
import {
  StockPhotoNotFoundException,
  StockPhotosDisabledException,
  StockProviderUnavailableException,
  StockQuotaLowException,
} from './stock.exceptions';

const MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 30_000;
// Identical searches from many tenants (e.g. the "barbería" chip) are served from memory.
const SEARCH_CACHE_ENTRIES = 200;
const SEARCH_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// Searches stop while this many provider calls remain, so imports can still finish.
const SEARCH_QUOTA_RESERVE = 10;

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);
  private readonly cache = new LruCache<StockSearchResponseDto>(
    SEARCH_CACHE_ENTRIES,
    SEARCH_CACHE_TTL_MS,
  );

  constructor(
    @Inject(STOCK_PHOTO_PROVIDER)
    private readonly provider: StockPhotoProviderPort,
    @Inject(DATABASE) private readonly db: Database,
    private readonly sites: SitesService,
    private readonly images: ImageOptimizer,
  ) {}

  status(): StockStatusDto {
    return { enabled: this.provider.enabled };
  }

  async search(
    rawQuery: string,
    page = 1,
    perPage = STOCK_MAX_PER_PAGE,
  ): Promise<StockSearchResponseDto> {
    if (!this.provider.enabled) throw new StockPhotosDisabledException();
    const query = rawQuery.trim().replace(/\s+/g, ' ').toLowerCase();
    const key = `${query}|${page}|${perPage}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    this.assertQuota(SEARCH_QUOTA_RESERVE);
    const result = await this.provider.search(query, page, perPage);
    const dto: StockSearchResponseDto = {
      photos: result.photos.map(toDto),
      page: result.page,
      perPage: result.perPage,
      totalResults: result.totalResults,
      hasNext: result.hasNext,
    };
    this.cache.set(key, dto);
    return dto;
  }

  /** Server-side fetch by id only (never a client URL), optimized like any upload, attribution kept. */
  async importPhoto(
    tenantId: string,
    userSub: string,
    photoId: string,
  ): Promise<UploadedAssetResponseDto> {
    if (!this.provider.enabled) throw new StockPhotosDisabledException();
    await this.sites.assertAssetAccess(tenantId, userSub);
    this.assertQuota(0);

    const photo = await this.provider.getPhoto(photoId);
    if (!photo) throw new StockPhotoNotFoundException();

    const path = join(tmpdir(), `lz-stock-${randomUUID()}`);
    try {
      await this.download(
        photo.downloadUrl(this.images.options.maxDimension),
        path,
      );
      const asset = await this.sites.addAssetFromFile(
        tenantId,
        userSub,
        path,
        `pixabay-${photo.id}`,
      );
      await this.recordAttribution(tenantId, photo, asset);
      return asset;
    } finally {
      await rm(path, { force: true }).catch(() => undefined);
    }
  }

  private assertQuota(reserve: number): void {
    const quota = this.provider.quota();
    if (!quota || quota.remaining > reserve) return;
    const waitMs = quota.resetAt - Date.now();
    if (waitMs <= 0) return;
    throw new StockQuotaLowException(Math.ceil(waitMs / 1000));
  }

  /** Streams to disk with a hard byte cap; only https on Pixabay image hosts, no redirects. */
  private async download(url: string, path: string): Promise<void> {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      !PIXABAY_IMAGE_HOSTS.has(parsed.hostname)
    ) {
      throw new StockProviderUnavailableException();
    }
    let res: Response;
    try {
      res = await fetch(parsed, {
        redirect: 'error',
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Stock download failed: ${(error as Error).message}`);
      throw new StockProviderUnavailableException();
    }
    const type = res.headers.get('content-type') ?? '';
    const declared = Number(res.headers.get('content-length') ?? 0);
    if (
      !res.ok ||
      !res.body ||
      !type.startsWith('image/') ||
      declared > MAX_DOWNLOAD_BYTES
    ) {
      await res.body?.cancel().catch(() => undefined);
      this.logger.warn(
        `Stock download rejected: HTTP ${res.status}, ${type}, ${declared} bytes`,
      );
      throw new StockProviderUnavailableException();
    }

    let received = 0;
    const cap = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        received += chunk.length;
        if (received > MAX_DOWNLOAD_BYTES) {
          callback(new Error('download exceeds the size cap'));
        } else callback(null, chunk);
      },
    });
    try {
      await pipeline(
        Readable.fromWeb(res.body as unknown as WebReadableStream),
        cap,
        createWriteStream(path),
      );
    } catch (error) {
      this.logger.warn(`Stock download aborted: ${(error as Error).message}`);
      throw new StockProviderUnavailableException();
    }
  }

  private async recordAttribution(
    tenantId: string,
    photo: StockPhoto,
    asset: UploadedAssetResponseDto,
  ): Promise<void> {
    await this.db.execute(
      sql`INSERT INTO public.tenant_stock_assets
            (tenant_id, provider, provider_photo_id, photographer, photographer_url, photo_url, asset_id, src)
          VALUES (${tenantId}::uuid, 'pixabay', ${photo.id}, ${photo.photographer},
                  ${photo.photographerUrl}, ${photo.pageUrl}, ${asset.id}::uuid, ${asset.src})`,
    );
  }
}

function toDto(photo: StockPhoto): StockPhotoDto {
  return {
    id: photo.id,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    avgColor: photo.avgColor,
    photographer: photo.photographer,
    photographerUrl: photo.photographerUrl,
    pageUrl: photo.pageUrl,
    thumbUrl: photo.thumbUrl,
  };
}
