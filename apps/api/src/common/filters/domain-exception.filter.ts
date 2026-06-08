import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';

/**
 * Consistent, typable error envelope returned for every unhandled error:
 *
 * ```json
 * { "error": { "code": "string", "message": "string", "details"?: unknown } }
 * ```
 *
 * - {@link DomainException} → its `code` / `status` / `details`.
 * - Nest `HttpException` (incl. `ValidationPipe`, `UnauthorizedException`) →
 *   mapped to a code derived from the status.
 * - Anything else → `500 INTERNAL_ERROR` (details hidden).
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } = this.normalize(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${code}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({ error: { code, message, details } });
  }

  private normalize(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof DomainException) {
      return {
        status: exception.status,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as Record<string, unknown>).message as string) ??
            exception.message;
      const details =
        typeof body === 'object' ? (body as Record<string, unknown>) : undefined;
      return { status, code: this.codeFromStatus(status), message, details };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    };
  }

  private codeFromStatus(status: number): string {
    const name = HttpStatus[status];
    return typeof name === 'string' ? name : `HTTP_${status}`;
  }
}
