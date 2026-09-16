import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** The authenticated user does not own the requested tenant. */
export class TenantAccessDeniedException extends DomainException {
  readonly code = 'TENANT_ACCESS_DENIED';
  readonly status = HttpStatus.FORBIDDEN;

  constructor() {
    super('You do not have access to this tenant.');
  }
}

/** No site row exists yet for the tenant (load the schema first). */
export class SiteNotFoundException extends DomainException {
  readonly code = 'SITE_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No site exists for this tenant yet.');
  }
}

/** No active template is available to seed a new site from. */
export class NoTemplateAvailableException extends DomainException {
  readonly code = 'NO_TEMPLATE_AVAILABLE';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('No active template is available to initialize a site.');
  }
}

/** The requested template id does not exist or is not active. */
export class TemplateNotFoundException extends DomainException {
  readonly code = 'TEMPLATE_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('Template not found.');
  }
}

/** A site schema already exists for this tenant; use the change-template flow instead. */
export class SiteSchemaAlreadyExistsException extends DomainException {
  readonly code = 'SITE_SCHEMA_ALREADY_EXISTS';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super('Site schema already exists. Use PATCH to change template.');
  }
}

/** Changing the template would reset existing site content; caller must resend with confirm: true. */
export class TemplateChangeRequiresConfirmationException extends DomainException {
  readonly code = 'TEMPLATE_CHANGE_REQUIRES_CONFIRMATION';
  readonly status = HttpStatus.CONFLICT;

  constructor() {
    super(
      'Changing the template will reset your current site content. Send the request again with { confirm: true } to proceed.',
      { requiresConfirmation: true },
    );
  }
}

/** Storage rejected one of the uploaded editor assets. */
export class AssetUploadFailedException extends DomainException {
  readonly code = 'ASSET_UPLOAD_FAILED';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor(filename: string) {
    super(`Could not upload "${filename}". Please try again.`, { filename });
  }
}

/** Only images may be uploaded to the public assets bucket. */
export class UnsupportedAssetTypeException extends DomainException {
  readonly code = 'UNSUPPORTED_ASSET_TYPE';
  readonly status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;

  constructor(mimeType: string) {
    super(`"${mimeType}" is not a supported image type.`, { mimeType });
  }
}

/** The upload request carried no files. */
export class NoAssetsProvidedException extends DomainException {
  readonly code = 'NO_ASSETS_PROVIDED';
  readonly status = HttpStatus.BAD_REQUEST;

  constructor() {
    super('No files were provided.');
  }
}

/** No tenant row exists yet for the authenticated user. */
export class TenantNotFoundException extends DomainException {
  readonly code = 'TENANT_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('No tenant exists for this user.');
  }
}
