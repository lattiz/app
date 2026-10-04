import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import type {
  SourceObject,
  SourceStore,
  TargetHead,
  TargetStore,
} from './copy-core';

const HEX32 = /^[0-9a-f]{32}$/i;

function etagToMd5(etag: string | undefined): string | undefined {
  const bare = etag?.replace(/"/g, '');
  return bare && HEX32.test(bare) ? bare.toLowerCase() : undefined;
}

export interface SupabaseSourceConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

/** Lists every object of a Supabase Storage bucket (folders are walked) and downloads with the service role. */
export function supabaseSource(config: SupabaseSourceConfig): SourceStore {
  const client = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const bucket = client.storage.from(config.bucket);
  const PAGE = 100;

  async function walk(prefix: string, out: SourceObject[]): Promise<void> {
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await bucket.list(prefix, {
        limit: PAGE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });
      if (error) throw new Error(`list "${prefix}": ${error.message}`);
      for (const entry of data ?? []) {
        const key = prefix ? `${prefix}/${entry.name}` : entry.name;
        // Folders come back without an id.
        if (entry.id === null || entry.id === undefined) {
          await walk(key, out);
          continue;
        }
        const meta = (entry.metadata ?? {}) as Record<string, unknown>;
        out.push({
          key,
          size: Number(meta.size ?? meta.contentLength ?? 0),
          contentType:
            typeof meta.mimetype === 'string' ? meta.mimetype : undefined,
          md5: etagToMd5(typeof meta.eTag === 'string' ? meta.eTag : undefined),
        });
      }
      if (!data || data.length < PAGE) return;
    }
  }

  return {
    async list() {
      const out: SourceObject[] = [];
      await walk('', out);
      return out.sort((a, b) => a.key.localeCompare(b.key));
    },
    async download(key) {
      const { data, error } = await bucket.download(key);
      if (error || !data) {
        throw new Error(`download "${key}": ${error?.message ?? 'no data'}`);
      }
      return Buffer.from(await data.arrayBuffer());
    },
  };
}

export interface S3TargetConfig {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Only for local S3 stand-ins; R2 uses virtual-hosted style. */
  forcePathStyle?: boolean;
  region?: string;
}

export function makeS3Client(config: S3TargetConfig): S3Client {
  return new S3Client({
    region: config.region ?? 'auto',
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Same settings as the API adapter (R2 does not require request checksums).
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

/** S3-compatible target (R2 in production). */
export function s3Target(
  config: S3TargetConfig,
  client: S3Client = makeS3Client(config),
): TargetStore {
  return {
    async head(key): Promise<TargetHead | undefined> {
      try {
        const res = await client.send(
          new HeadObjectCommand({ Bucket: config.bucket, Key: key }),
        );
        return {
          size: res.ContentLength ?? 0,
          contentType: res.ContentType,
          cacheControl: res.CacheControl,
          md5: etagToMd5(res.ETag),
        };
      } catch (error) {
        const status = (error as { $metadata?: { httpStatusCode?: number } })
          .$metadata?.httpStatusCode;
        if (status === 404 || (error as Error).name === 'NotFound') {
          return undefined;
        }
        throw error;
      }
    },
    async put(key, body, contentType, cacheControl) {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentLength: body.length,
          ContentType: contentType,
          CacheControl: cacheControl,
        }),
      );
    },
    async list() {
      const out: Array<{ key: string; size: number }> = [];
      let token: string | undefined;
      do {
        const res = await client.send(
          new ListObjectsV2Command({
            Bucket: config.bucket,
            ContinuationToken: token,
          }),
        );
        for (const o of res.Contents ?? []) {
          if (o.Key) out.push({ key: o.Key, size: o.Size ?? 0 });
        }
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (token);
      return out;
    },
    async download(key) {
      const res = await client.send(
        new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      );
      if (!res.Body) throw new Error(`download "${key}": empty body`);
      return Buffer.from(await res.Body.transformToByteArray());
    },
  };
}
