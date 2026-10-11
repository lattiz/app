import { readFile, stat } from 'node:fs/promises';
import sharp, { type Metadata } from 'sharp';

/**
 * Framework-free image pipeline shared by the API (editor uploads, stock imports)
 * and scripts/parse-and-seed-template.ts. Output is WebP capped at
 * `maxDimension`; it is tuned for a 900 MB container, so every call must go
 * through `run()` when requests can overlap.
 */

export interface ImageOptimizerOptions {
  maxDimension: number;
  webpQuality: number;
  /** Concurrent `run()` tasks. */
  concurrency: number;
  /** `run()` tasks allowed to wait; one more and `ImageOptimizerBusyError` is thrown. */
  queueMax: number;
}

export interface OptimizedImage {
  body: Buffer;
  mimeType: string;
  /** With the leading dot, e.g. `.webp`. */
  extension: string;
  width: number | null;
  height: number | null;
  originalBytes: number;
  bytes: number;
  /** False when the input was passed through or kept because re-encoding would inflate it. */
  transformed: boolean;
}

export type ImageRejectionReason =
  | 'heic'
  | 'unreadable'
  | 'unsupported'
  | 'too_many_pixels'
  | 'animated_too_large';

/** The input can't be turned into a web image; `message` is user-facing (es-MX). */
export class ImageRejectedError extends Error {
  constructor(
    readonly reason: ImageRejectionReason,
    message: string,
  ) {
    super(message);
    this.name = 'ImageRejectedError';
  }
}

/** The bounded queue is full; callers should answer 503 + Retry-After. */
export class ImageOptimizerBusyError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('Image optimizer queue is full.');
    this.name = 'ImageOptimizerBusyError';
  }
}

type EnvReader = (key: string) => string | undefined;

export const IMAGE_OPTIMIZER_DEFAULTS: ImageOptimizerOptions = {
  maxDimension: 2000,
  webpQuality: 80,
  concurrency: 1,
  queueMax: 4,
};

/** IMAGE_* env with defaults; a malformed value throws at boot instead of per request. */
export function imageOptimizerOptionsFromEnv(
  env: EnvReader,
): ImageOptimizerOptions {
  const int = (key: string, fallback: number, min: number, max: number) => {
    const raw = env(key)?.trim();
    if (!raw) return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`${key} must be an integer in [${min}, ${max}].`);
    }
    return value;
  };
  return {
    maxDimension: int('IMAGE_MAX_DIMENSION', 2000, 320, 8000),
    webpQuality: int('IMAGE_WEBP_QUALITY', 80, 30, 100),
    concurrency: int('IMAGE_OPTIMIZER_CONCURRENCY', 1, 1, 4),
    queueMax: int('IMAGE_OPTIMIZER_QUEUE_MAX', 4, 0, 50),
  };
}

const ANIMATED_PASSTHROUGH_MAX_BYTES = 5 * 1024 * 1024;
// JPEG decodes with shrink-on-load, so only other formats need a tighter pixel cap.
const NON_JPEG_MAX_PIXELS = 50_000_000;
const DECODABLE = new Set([
  'jpeg',
  'png',
  'webp',
  'gif',
  'avif',
  'heif',
  'tiff',
]);
// Kept as-is only when it carries no EXIF/XMP/IPTC (GPS, camera serials) and needs no rotation.
const KEEPABLE: Record<string, { mimeType: string; extension: string }> = {
  jpeg: { mimeType: 'image/jpeg', extension: '.jpg' },
  png: { mimeType: 'image/png', extension: '.png' },
  webp: { mimeType: 'image/webp', extension: '.webp' },
};
const PASSTHROUGH: Record<string, { mimeType: string; extension: string }> = {
  svg: { mimeType: 'image/svg+xml', extension: '.svg' },
  gif: { mimeType: 'image/gif', extension: '.gif' },
  webp: { mimeType: 'image/webp', extension: '.webp' },
};

const MESSAGES: Record<ImageRejectionReason, string> = {
  heic: 'Las fotos HEIC/HEIF (iPhone) no son compatibles. Expórtala como JPG o cambia la cámara a "Más compatible" e inténtalo de nuevo.',
  unreadable:
    'No pudimos leer la imagen. Prueba con un archivo JPG, PNG o WebP.',
  unsupported:
    'Este formato de imagen no es compatible. Usa JPG, PNG, WebP, GIF o SVG.',
  too_many_pixels:
    'La imagen tiene demasiados píxeles. Redúcela a menos de 50 megapíxeles e inténtalo de nuevo.',
  animated_too_large: 'Las imágenes animadas deben pesar menos de 5 MB.',
};

export function imageRejectionMessage(reason: ImageRejectionReason): string {
  return MESSAGES[reason];
}

function reject(reason: ImageRejectionReason): ImageRejectedError {
  return new ImageRejectedError(reason, MESSAGES[reason]);
}

export class ImageOptimizer {
  private active = 0;
  private readonly waiting: (() => void)[] = [];

  constructor(
    readonly options: ImageOptimizerOptions = IMAGE_OPTIMIZER_DEFAULTS,
  ) {
    // Process-wide libvips settings: no op cache, one worker thread per image.
    sharp.cache(false);
    sharp.concurrency(1);
  }

  /** Runs `task` inside the concurrency gate; throws ImageOptimizerBusyError when the queue is full. */
  async run<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await task();
    } finally {
      this.release();
    }
  }

  /** Optimizes one image from a file path (preferred: never fully buffered) or a Buffer. Not gated. */
  async optimize(input: string | Buffer): Promise<OptimizedImage> {
    const originalBytes =
      typeof input === 'string' ? (await stat(input)).size : input.length;

    let meta: Metadata;
    try {
      meta = await sharp(input, { limitInputPixels: false }).metadata();
    } catch {
      throw reject('unreadable');
    }

    if (meta.format === 'heif' && meta.compression !== 'av1')
      throw reject('heic');

    const pages = meta.pages ?? 1;
    if (meta.format === 'svg' || (pages > 1 && PASSTHROUGH[meta.format])) {
      if (
        meta.format !== 'svg' &&
        originalBytes > ANIMATED_PASSTHROUGH_MAX_BYTES
      ) {
        throw reject('animated_too_large');
      }
      const kind = PASSTHROUGH[meta.format];
      const body = await readInput(input);
      return {
        body,
        ...kind,
        width: meta.width ?? null,
        height: meta.pageHeight ?? meta.height ?? null,
        originalBytes,
        bytes: body.length,
        transformed: false,
      };
    }

    if (!DECODABLE.has(meta.format)) throw reject('unsupported');
    const isJpeg = meta.format === 'jpeg';
    if (!isJpeg && meta.width * meta.height > NON_JPEG_MAX_PIXELS) {
      throw reject('too_many_pixels');
    }

    const { maxDimension, webpQuality } = this.options;
    let encoded: { data: Buffer; info: { width: number; height: number } };
    try {
      encoded = await sharp(input, {
        sequentialRead: true,
        failOn: 'error',
        limitInputPixels: isJpeg ? true : NON_JPEG_MAX_PIXELS,
      })
        .autoOrient()
        // resize() right after load lets libjpeg shrink-on-load before full decode.
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: webpQuality, effort: 4 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw reject('unreadable');
    }

    const keepable = KEEPABLE[meta.format];
    const oriented = meta.autoOrient ?? {
      width: meta.width,
      height: meta.height,
    };
    const keepOriginal =
      keepable !== undefined &&
      encoded.data.length >= originalBytes &&
      Math.max(oriented.width, oriented.height) <= maxDimension &&
      (meta.orientation ?? 1) === 1 &&
      !meta.exif &&
      !meta.xmp &&
      !meta.iptc;
    if (keepOriginal) {
      const body = await readInput(input);
      return {
        body,
        ...keepable,
        width: oriented.width,
        height: oriented.height,
        originalBytes,
        bytes: body.length,
        transformed: false,
      };
    }

    return {
      body: encoded.data,
      mimeType: 'image/webp',
      extension: '.webp',
      width: encoded.info.width,
      height: encoded.info.height,
      originalBytes,
      bytes: encoded.data.length,
      transformed: true,
    };
  }

  private async acquire(): Promise<void> {
    if (this.active < this.options.concurrency) {
      this.active += 1;
      return;
    }
    if (this.waiting.length >= this.options.queueMax) {
      throw new ImageOptimizerBusyError(5 * (this.waiting.length + 1));
    }
    // release() hands its slot straight to the next waiter, so `active` is unchanged here.
    await new Promise<void>((resolve) => this.waiting.push(resolve));
  }

  private release(): void {
    const next = this.waiting.shift();
    if (next) next();
    else this.active -= 1;
  }
}

function readInput(input: string | Buffer): Promise<Buffer> {
  return typeof input === 'string' ? readFile(input) : Promise.resolve(input);
}
