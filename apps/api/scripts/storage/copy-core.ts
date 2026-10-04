import { createHash } from 'node:crypto';

/** One object as listed by the source (Supabase Storage). */
export interface SourceObject {
  key: string;
  size: number;
  contentType: string | undefined;
  /** md5 hex when the source reports it (Supabase eTag), else undefined. */
  md5: string | undefined;
}

export interface TargetHead {
  size: number;
  contentType: string | undefined;
  cacheControl: string | undefined;
  /** md5 hex of the object (R2 ETag of a single-part PUT), else undefined. */
  md5: string | undefined;
}

export interface SourceStore {
  list(): Promise<SourceObject[]>;
  download(key: string): Promise<Buffer>;
}

export interface TargetStore {
  head(key: string): Promise<TargetHead | undefined>;
  put(
    key: string,
    body: Buffer,
    contentType: string,
    cacheControl: string,
  ): Promise<void>;
  list(): Promise<Array<{ key: string; size: number }>>;
  download(key: string): Promise<Buffer>;
}

export interface Logger {
  log(message: string): void;
  error(message: string): void;
}

// Same policy as R2StorageAdapter: unique-key objects are immutable, the rest may be rewritten.
export const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';
export const MUTABLE_CACHE = 'public, max-age=300';
const IMMUTABLE_PREFIXES = ['tenant-assets/'];

export function cacheControlFor(key: string): string {
  return IMMUTABLE_PREFIXES.some((p) => key.startsWith(p))
    ? IMMUTABLE_CACHE
    : MUTABLE_CACHE;
}

export function md5(buf: Buffer): string {
  return createHash('md5').update(buf).digest('hex');
}

export function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

/** Mime types compared without parameters/case ("image/png; charset=x" == "IMAGE/PNG"). */
export function normalizeContentType(value: string | undefined): string {
  return (value ?? '').split(';')[0].trim().toLowerCase();
}

export interface CopyReport {
  total: number;
  copied: string[];
  skipped: string[];
  failed: Array<{ key: string; error: string }>;
  wouldCopy: string[];
  bytesCopied: number;
}

export interface CopyOptions {
  dryRun: boolean;
  concurrency?: number;
  /** Only copy keys starting with this prefix. */
  prefix?: string;
}

const FALLBACK_CONTENT_TYPE = 'application/octet-stream';

/**
 * Idempotent: an object already in the target with the same size, content type and
 * (when both sides know it) md5 is skipped; anything else is (re)written.
 */
export async function copyAll(
  source: SourceStore,
  target: TargetStore,
  options: CopyOptions,
  logger: Logger,
): Promise<CopyReport> {
  const objects = (await source.list()).filter(
    (o) => !options.prefix || o.key.startsWith(options.prefix),
  );
  const report: CopyReport = {
    total: objects.length,
    copied: [],
    skipped: [],
    failed: [],
    wouldCopy: [],
    bytesCopied: 0,
  };

  await runPool(objects, options.concurrency ?? 4, async (obj) => {
    try {
      const contentType = obj.contentType || FALLBACK_CONTENT_TYPE;
      const existing = await target.head(obj.key);
      const same =
        existing !== undefined &&
        existing.size === obj.size &&
        normalizeContentType(existing.contentType) ===
          normalizeContentType(contentType) &&
        (obj.md5 === undefined ||
          existing.md5 === undefined ||
          obj.md5 === existing.md5);
      if (same) {
        report.skipped.push(obj.key);
        logger.log(`skip   ${obj.key} (already in target)`);
        return;
      }
      if (options.dryRun) {
        report.wouldCopy.push(obj.key);
        logger.log(
          `would  ${obj.key} (${obj.size} B, ${contentType})${existing ? ' [differs, overwrite]' : ''}`,
        );
        return;
      }
      const body = await source.download(obj.key);
      if (body.length !== obj.size) {
        throw new Error(
          `downloaded ${body.length} B but source lists ${obj.size} B`,
        );
      }
      if (obj.md5 && md5(body) !== obj.md5) {
        throw new Error(
          `md5 mismatch after download (listed ${obj.md5}, got ${md5(body)})`,
        );
      }
      await target.put(obj.key, body, contentType, cacheControlFor(obj.key));
      report.copied.push(obj.key);
      report.bytesCopied += body.length;
      logger.log(`copied ${obj.key} (${body.length} B, ${contentType})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.failed.push({ key: obj.key, error: message });
      logger.error(`FAILED ${obj.key}: ${message}`);
    }
  });

  return report;
}

export interface VerifyOptions {
  checksum: boolean;
  concurrency?: number;
  prefix?: string;
}

export interface VerifyReport {
  sourceCount: number;
  targetCount: number;
  sourceBytes: number;
  targetBytesOfSourceKeys: number;
  missing: string[];
  sizeMismatch: string[];
  contentTypeMismatch: string[];
  missingCacheControl: string[];
  checksumMismatch: string[];
  /** In the target but not the source: new uploads after the flip; informational. */
  extraInTarget: string[];
  ok: boolean;
}

/** Count + bytes + content-type + cache-control, and optionally a sha256 of every object on both sides. */
export async function verifyAll(
  source: SourceStore,
  target: TargetStore,
  options: VerifyOptions,
  logger: Logger,
): Promise<VerifyReport> {
  const keep = (key: string): boolean =>
    !options.prefix || key.startsWith(options.prefix);
  const sourceObjects = (await source.list()).filter((o) => keep(o.key));
  const targetObjects = (await target.list()).filter((o) => keep(o.key));
  const sourceKeys = new Set(sourceObjects.map((o) => o.key));
  const targetSizes = new Map(targetObjects.map((o) => [o.key, o.size]));

  const report: VerifyReport = {
    sourceCount: sourceObjects.length,
    targetCount: targetObjects.length,
    sourceBytes: sourceObjects.reduce((n, o) => n + o.size, 0),
    targetBytesOfSourceKeys: 0,
    missing: [],
    sizeMismatch: [],
    contentTypeMismatch: [],
    missingCacheControl: [],
    checksumMismatch: [],
    extraInTarget: targetObjects
      .filter((o) => !sourceKeys.has(o.key))
      .map((o) => o.key),
    ok: false,
  };

  await runPool(sourceObjects, options.concurrency ?? 4, async (obj) => {
    const size = targetSizes.get(obj.key);
    if (size === undefined) {
      report.missing.push(obj.key);
      logger.error(`MISSING ${obj.key}`);
      return;
    }
    report.targetBytesOfSourceKeys += size;
    if (size !== obj.size) {
      report.sizeMismatch.push(obj.key);
      logger.error(`SIZE ${obj.key}: source ${obj.size} B, target ${size} B`);
    }
    const head = await target.head(obj.key);
    if (!head) {
      report.missing.push(obj.key);
      return;
    }
    const expectedType = obj.contentType || FALLBACK_CONTENT_TYPE;
    if (
      normalizeContentType(head.contentType) !==
      normalizeContentType(expectedType)
    ) {
      report.contentTypeMismatch.push(obj.key);
      logger.error(
        `CONTENT-TYPE ${obj.key}: source ${expectedType}, target ${head.contentType}`,
      );
    }
    if (!head.cacheControl) {
      report.missingCacheControl.push(obj.key);
      logger.error(`CACHE-CONTROL missing on ${obj.key}`);
    }
    if (options.checksum) {
      const [a, b] = await Promise.all([
        source.download(obj.key),
        target.download(obj.key),
      ]);
      if (sha256(a) !== sha256(b)) {
        report.checksumMismatch.push(obj.key);
        logger.error(`CHECKSUM ${obj.key}: sha256 differs`);
      }
    }
  });

  report.missing.sort();
  report.ok =
    report.missing.length === 0 &&
    report.sizeMismatch.length === 0 &&
    report.contentTypeMismatch.length === 0 &&
    report.missingCacheControl.length === 0 &&
    report.checksumMismatch.length === 0 &&
    report.sourceCount > 0;
  return report;
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const runners = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    async () => {
      while (next < items.length) {
        const item = items[next++];
        await worker(item);
      }
    },
  );
  await Promise.all(runners);
}

/** Old (Supabase) and new (R2) URL prefixes, exact-match; the DB rewrite migration uses the same pair. */
export interface UrlPrefixes {
  oldPrefix: string;
  newPrefix: string;
}

/**
 * Keys referenced by a blob of JSON/HTML text, whatever the slash escaping and URL prefix.
 * Stops at the first character that cannot be part of a stored key (so `?v=` and quotes end it).
 */
export function extractReferencedKeys(
  text: string,
  prefixes: UrlPrefixes,
): Set<string> {
  const normalized = text.replace(/\\+\//g, '/');
  const keys = new Set<string>();
  for (const prefix of [prefixes.oldPrefix, prefixes.newPrefix]) {
    let from = 0;
    for (;;) {
      const index = normalized.indexOf(prefix, from);
      if (index === -1) break;
      const start = index + prefix.length;
      const match = /^[A-Za-z0-9._~%@\-/]+/.exec(normalized.slice(start));
      if (match) keys.add(safeDecode(match[0]));
      from = start;
    }
  }
  return keys;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
