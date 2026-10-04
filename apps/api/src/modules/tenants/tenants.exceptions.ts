import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** No tenant row exists yet for the authenticated user. */
export class TenantNotFoundException extends DomainException {
  readonly code = 'TENANT_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No tenant exists for this user.');
  }
}

/** The authenticated user does not own the requested tenant. */
export class TenantAccessDeniedException extends DomainException {
  readonly code = 'TENANT_ACCESS_DENIED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('You do not have access to this tenant.');
  }
}

/** No file came through on a branding upload. */
export class NoBrandingFileProvidedException extends DomainException {
  readonly code = 'NO_BRANDING_FILE_PROVIDED';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super('No file was provided.');
  }
}

/** The uploaded branding file has a mime type this slot does not accept. */
export class UnsupportedBrandingTypeException extends DomainException {
  readonly code = 'UNSUPPORTED_BRANDING_TYPE';
  readonly status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;

  constructor(mimeType: string, allowed: readonly string[]) {
    super(`Unsupported file type "${mimeType}".`, { mimeType, allowed });
  }
}

/** The uploaded branding file exceeds the limit for its slot. */
export class BrandingFileTooLargeException extends DomainException {
  readonly code = 'BRANDING_FILE_TOO_LARGE';
  readonly status = HttpStatus.PAYLOAD_TOO_LARGE;

  constructor(maxBytes: number) {
    super(`File is too large (max ${Math.round(maxBytes / 1024 / 1024)}MB).`, {
      maxBytes,
    });
  }
}

/** Storage rejected the branding upload. */
export class BrandingUploadFailedException extends DomainException {
  readonly code = 'BRANDING_UPLOAD_FAILED';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor() {
    super('Could not store the image. Try again.');
  }
}

/** The chosen site address does not meet the format rules (3-32 chars, a-z, 0-9, single hyphens). */
export class SlugInvalidException extends DomainException {
  readonly code = 'SLUG_INVALID';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super(
      'The address must be 3-32 characters: lowercase letters, numbers and single hyphens, not starting or ending with one.',
    );
  }
}

/** The chosen site address is on the reserved list. */
export class SlugReservedException extends DomainException {
  readonly code = 'SLUG_RESERVED';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super('This address is reserved.');
  }
}

/** Another tenant already owns the chosen site address. */
export class SlugTakenException extends DomainException {
  readonly code = 'SLUG_TAKEN';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('This address is already taken.');
  }
}
