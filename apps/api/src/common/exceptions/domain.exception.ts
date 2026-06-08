/**
 * Base class for domain-level errors.
 *
 * Domain and application code throw subclasses of `DomainException` instead of
 * HTTP exceptions, keeping those layers framework-agnostic. The global
 * {@link DomainExceptionFilter} maps them to a consistent HTTP response shape.
 */
export abstract class DomainException extends Error {
  /** Stable, machine-readable error code (e.g. `USER_NOT_FOUND`). */
  abstract readonly code: string;

  /** HTTP status this error maps to at the interface boundary. */
  abstract readonly status: number;

  /** Optional structured context for the client. */
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.details = details;
  }
}
