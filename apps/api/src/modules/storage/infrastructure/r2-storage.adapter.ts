import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  type DeleteObjectsCommandOutput,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type {
  ObjectStoragePort,
  UploadOptions,
} from '../domain/object-storage.port';
import {
  classifyHttpStatus,
  ObjectStorageException,
} from '../domain/object-storage.exceptions';
import {
  assertRemovableTenantPrefix,
  assertSafePath,
  assertSafePrefix,
  encodePath,
  pathFromPublicUrl,
} from '../domain/storage-path';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Origin the bucket's custom domain serves from, e.g. https://assets.lattiz.app (no trailing slash). */
  publicUrl: string;
}

/** The only part of S3Client the adapter uses — lets tests stub the wire. */
export interface S3Sender {
  send(
    command:
      | PutObjectCommand
      | DeleteObjectCommand
      | DeleteObjectsCommand
      | ListObjectsV2Command,
  ): Promise<unknown>;
}

// Unique keys never change, so browsers and Cloudflare may keep them for good.
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';
// Rewritable keys (upsert) must revalidate soon after an overwrite.
const MUTABLE_CACHE = 'public, max-age=300';

const REQUEST_TIMEOUT_MS = 30_000;
const CONNECTION_TIMEOUT_MS = 5_000;
/** DeleteObjects accepts at most 1000 keys; ListObjectsV2 pages are capped the same way. */
const DELETE_BATCH = 1000;

/** Stores public assets in a Cloudflare R2 bucket over its S3-compatible API. */
export class R2StorageAdapter implements ObjectStoragePort {
  constructor(
    private readonly config: R2Config,
    private readonly client: S3Sender = createR2Client(config),
  ) {}

  async uploadPublic(
    path: string,
    body: Buffer,
    contentType: string,
    options: UploadOptions = {},
  ): Promise<string> {
    assertSafePath('upload', path);
    await this.send(
      'upload',
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: path,
        Body: body,
        ContentLength: body.length,
        ContentType: contentType,
        CacheControl: options.upsert ? MUTABLE_CACHE : IMMUTABLE_CACHE,
      }),
    );
    return this.publicUrl(path);
  }

  async removePublic(path: string): Promise<void> {
    assertSafePath('delete', path);
    await this.send(
      'delete',
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: path }),
    );
  }

  publicUrl(path: string): string {
    return `${this.config.publicUrl}/${encodePath(path)}`;
  }

  pathFromPublicUrl(url: string | null | undefined): string | null {
    return pathFromPublicUrl(url, this.config.publicUrl);
  }

  async usageBytes(prefix: string): Promise<number> {
    assertSafePrefix('usage', prefix);
    let total = 0;
    let token: string | undefined;
    for (;;) {
      const page = await this.listPage(prefix, token);
      for (const object of page.Contents ?? []) {
        total += object.Size ?? 0;
      }
      if (!page.IsTruncated) return total;
      const next = page.NextContinuationToken;
      if (!next || next === token) {
        throw new ObjectStorageException(
          'usage',
          'rejected',
          'ListObjectsV2 was truncated without a new continuation token.',
        );
      }
      token = next;
    }
  }

  async removePrefix(
    prefix: string,
  ): Promise<{ deletedObjects: number; deletedBytes: number }> {
    assertRemovableTenantPrefix(prefix);
    let deletedObjects = 0;
    let deletedBytes = 0;
    let token: string | undefined;
    for (;;) {
      const page = await this.listPage(prefix, token, 'removePrefix', DELETE_BATCH);
      const objects = keysInPrefix(prefix, page.Contents ?? []);
      for (let i = 0; i < objects.length; i += DELETE_BATCH) {
        const batch = objects.slice(i, i + DELETE_BATCH);
        await this.deleteBatch(batch);
        deletedObjects += batch.length;
        for (const object of batch) deletedBytes += object.Size ?? 0;
      }
      if (!page.IsTruncated) break;
      const next = page.NextContinuationToken;
      if (!next || next === token) {
        throw new ObjectStorageException(
          'removePrefix',
          'rejected',
          'ListObjectsV2 was truncated without a new continuation token.',
        );
      }
      token = next;
    }

    const leftover = await this.listPage(prefix, undefined, 'removePrefix', DELETE_BATCH);
    if ((leftover.Contents ?? []).length > 0 || leftover.IsTruncated) {
      throw new ObjectStorageException(
        'removePrefix',
        'rejected',
        `Prefix "${prefix.slice(0, 80)}" still has objects after delete.`,
      );
    }
    return { deletedObjects, deletedBytes };
  }

  private async listPage(
    prefix: string,
    token: string | undefined,
    operation = 'usage',
    maxKeys?: number,
  ): Promise<ListObjectsV2CommandOutput> {
    try {
      return (await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.config.bucket,
          Prefix: prefix,
          ContinuationToken: token,
          ...(maxKeys === undefined ? {} : { MaxKeys: maxKeys }),
        }),
      )) as ListObjectsV2CommandOutput;
    } catch (error) {
      const failure = describeS3Error(error);
      throw new ObjectStorageException(
        operation,
        classifyHttpStatus(failure.httpStatus),
        failure.detail,
        failure.httpStatus,
      );
    }
  }

  private async deleteBatch(objects: { Key: string }[]): Promise<void> {
    let output: DeleteObjectsCommandOutput;
    try {
      output = (await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.config.bucket,
          Delete: { Objects: objects.map((object) => ({ Key: object.Key })) },
        }),
      )) as DeleteObjectsCommandOutput;
    } catch (error) {
      const failure = describeS3Error(error);
      throw new ObjectStorageException(
        'removePrefix',
        classifyHttpStatus(failure.httpStatus),
        failure.detail,
        failure.httpStatus,
      );
    }
    const first = output.Errors?.[0];
    if (!first) return;
    const detail = [first.Key, first.Code, first.Message].filter(Boolean).join(': ');
    throw new ObjectStorageException(
      'removePrefix',
      'rejected',
      detail || 'DeleteObjects reported an error.',
    );
  }

  private async send(
    operation: string,
    command: PutObjectCommand | DeleteObjectCommand,
  ): Promise<void> {
    try {
      await this.client.send(command);
    } catch (error) {
      const failure = describeS3Error(error);
      // S3 DeleteObject is already idempotent; a 404 here is still success for us.
      if (operation === 'delete' && failure.httpStatus === 404) return;
      throw new ObjectStorageException(
        operation,
        classifyHttpStatus(failure.httpStatus),
        failure.detail,
        failure.httpStatus,
      );
    }
  }
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // SDK >= 3.729 adds a trailing CRC32 checksum by default, which R2 once rejected; R2 never requires one.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    requestHandler: {
      requestTimeout: REQUEST_TIMEOUT_MS,
      connectionTimeout: CONNECTION_TIMEOUT_MS,
    },
  });
}

interface S3ErrorLike {
  name?: string;
  message?: string;
  $metadata?: { httpStatusCode?: number };
}

function keysInPrefix(
  prefix: string,
  contents: NonNullable<ListObjectsV2CommandOutput['Contents']>,
): { Key: string; Size?: number }[] {
  const objects: { Key: string; Size?: number }[] = [];
  for (const object of contents) {
    const key = object.Key;
    if (!key) continue;
    if (!key.startsWith(prefix)) {
      throw new ObjectStorageException(
        'removePrefix',
        'rejected',
        `ListObjectsV2 returned a key outside the prefix: "${key.slice(0, 80)}".`,
      );
    }
    objects.push({ Key: key, Size: object.Size });
  }
  return objects;
}

function describeS3Error(error: unknown): {
  httpStatus?: number;
  detail: string;
} {
  const e = (error ?? {}) as S3ErrorLike;
  const httpStatus = e.$metadata?.httpStatusCode;
  const detail = [e.name, e.message].filter(Boolean).join(': ');
  return { httpStatus, detail: detail || String(error) };
}
