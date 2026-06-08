/** Base for domain errors. Mapped to HTTP responses by DomainExceptionFilter. */
export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly status: number;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.details = details;
  }
}
