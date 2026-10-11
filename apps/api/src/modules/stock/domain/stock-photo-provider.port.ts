export interface StockPhoto {
  /** Provider id, as a string so other providers fit later. */
  id: string;
  width: number;
  height: number;
  alt: string;
  avgColor: string | null;
  photographer: string;
  photographerUrl: string;
  /** The photo's page on the provider site (attribution link). */
  pageUrl: string;
  /** ~350 px wide, for result grids. */
  thumbUrl: string;
  /** Source URL to download at most `maxDimension` px on the long side. */
  downloadUrl: (maxDimension: number) => string;
}

export interface StockSearchPage {
  photos: StockPhoto[];
  page: number;
  perPage: number;
  totalResults: number;
  hasNext: boolean;
}

/** Last rate-limit headers seen from the provider; null until the first call. */
export interface StockQuota {
  limit: number;
  remaining: number;
  /** Epoch ms when `remaining` resets. */
  resetAt: number;
}

export interface StockPhotoProviderPort {
  readonly enabled: boolean;
  search(
    query: string,
    page: number,
    perPage: number,
  ): Promise<StockSearchPage>;
  /** Null when the provider has no photo with this id. */
  getPhoto(id: string): Promise<StockPhoto | null>;
  quota(): StockQuota | null;
}

export const STOCK_PHOTO_PROVIDER = Symbol('STOCK_PHOTO_PROVIDER');
