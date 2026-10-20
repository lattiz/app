import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

/** PIXABAY_API_KEY is not configured on this API. */
export class StockPhotosDisabledException extends DomainException {
  readonly code = 'STOCK_PHOTOS_DISABLED';
  readonly status = HttpStatus.SERVICE_UNAVAILABLE;

  constructor() {
    super('Las fotos gratuitas no están disponibles en este momento.');
  }
}

/** The provider's hourly/monthly quota is nearly used up; searches pause until it resets. */
export class StockQuotaLowException extends DomainException {
  readonly code = 'STOCK_QUOTA_LOW';
  readonly status = HttpStatus.TOO_MANY_REQUESTS;
  readonly headers: Record<string, string>;

  constructor(retryAfterSeconds: number) {
    super(
      'Se alcanzó el límite de búsquedas de fotos gratuitas. Inténtalo de nuevo más tarde.',
      { retryAfterSeconds },
    );
    this.headers = { 'Retry-After': String(retryAfterSeconds) };
  }
}

/** The provider failed or answered something unusable. */
export class StockProviderUnavailableException extends DomainException {
  readonly code = 'STOCK_PROVIDER_UNAVAILABLE';
  readonly status = HttpStatus.BAD_GATEWAY;

  constructor() {
    super('No pudimos conectar con el banco de fotos. Inténtalo de nuevo.');
  }
}

/** No photo with that id at the provider. */
export class StockPhotoNotFoundException extends DomainException {
  readonly code = 'STOCK_PHOTO_NOT_FOUND';
  readonly status = HttpStatus.NOT_FOUND;

  constructor() {
    super('La foto ya no está disponible.');
  }
}
