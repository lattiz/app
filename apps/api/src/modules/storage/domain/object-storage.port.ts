export interface UploadOptions {
  /** The key may be rewritten later, so the object must not be cached as immutable. Default false. */
  upsert?: boolean;
}

export interface ObjectStoragePort {
  /** Stores `body` under `path` and returns its public URL. Throws ObjectStorageException. */
  uploadPublic(
    path: string,
    body: Buffer,
    contentType: string,
    options?: UploadOptions,
  ): Promise<string>;

  /** A missing object is not an error. Throws ObjectStorageException on provider failure. */
  removePublic(path: string): Promise<void>;

  /** Pure: the public URL an object at `path` is (or will be) served from. */
  publicUrl(path: string): string;

  /** Inverse of publicUrl, also for URLs written before the move to R2; null when the URL is not ours. */
  pathFromPublicUrl(url: string | null | undefined): string | null;

  /** Sum of object sizes whose key starts with `prefix`. Throws ObjectStorageException on provider failure. */
  usageBytes(prefix: string): Promise<number>;
}

export const OBJECT_STORAGE_PORT = Symbol('OBJECT_STORAGE_PORT');
