import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception';

/**
 * - config: our credentials/settings are wrong (401/403, missing config) — retrying will not help
 * - rejected: the provider refused the request (other 4xx)
 * - transient: no answer, 5xx, 429 or 408 — retrying later may work
 */
export type ObjectStorageFailureKind = 'config' | 'rejected' | 'transient';

/** The object storage provider failed an upload or delete; callers map it to a user-facing code. */
export class ObjectStorageException extends DomainException {
  readonly code = 'OBJECT_STORAGE_ERROR';
  readonly status = HttpStatus.BAD_GATEWAY;

  // Provider detail stays on the instance (logs): `details` would be serialized to the client.
  constructor(
    readonly operation: string,
    readonly kind: ObjectStorageFailureKind,
    readonly detail: string,
    readonly httpStatus?: number,
  ) {
    super(`Object storage ${operation} failed.`);
  }
}

const TRANSIENT_CLIENT_STATUSES = new Set([408, 425, 429]);

export function classifyHttpStatus(
  status: number | undefined,
): ObjectStorageFailureKind {
  if (status === 401 || status === 403) return 'config';
  if (
    status !== undefined &&
    status >= 400 &&
    status < 500 &&
    !TRANSIENT_CLIENT_STATUSES.has(status)
  ) {
    return 'rejected';
  }
  return 'transient';
}

/** Log-line description of any error thrown while talking to storage. */
export function describeStorageError(error: unknown): string {
  if (error instanceof ObjectStorageException) {
    return `${error.operation} ${error.kind}${error.httpStatus ? ` (${error.httpStatus})` : ''}: ${error.detail}`;
  }
  return error instanceof Error ? error.message : String(error);
}
