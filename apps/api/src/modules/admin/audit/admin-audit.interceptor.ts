import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { from, type Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { DomainException } from '../../../common/exceptions/domain.exception';
import {
  ADMIN_AUDIT_KEY,
  type AdminAuditMetadata,
} from './admin-audit.decorator';
import { AdminAuditService } from './admin-audit.service';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export interface AdminAuditEnrichment {
  targetId?: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Handler-supplied fields merged into the audit row after the response. */
      adminAudit?: AdminAuditEnrichment;
    }
  }
}

type HandlerOutcome =
  | { failed: false; body: unknown }
  | { failed: true; error: unknown };

@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AdminAuditInterceptor.name);

  constructor(
    private readonly audit: AdminAuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    if (READ_METHODS.has((request.method ?? '').toUpperCase())) {
      return next.handle();
    }

    const metadata = this.reflector.getAllAndOverride<
      AdminAuditMetadata | undefined
    >(ADMIN_AUDIT_KEY, [context.getHandler(), context.getClass()]);

    return next.handle().pipe(
      map((body: unknown): HandlerOutcome => ({ failed: false, body })),
      catchError((error: unknown) =>
        of<HandlerOutcome>({ failed: true, error }),
      ),
      concatMap((outcome) => from(this.persist(request, metadata, outcome))),
    );
  }

  private async persist(
    request: Request,
    metadata: AdminAuditMetadata | undefined,
    outcome: HandlerOutcome,
  ): Promise<unknown> {
    const method = (request.method ?? 'UNKNOWN').toUpperCase();
    const route = routeOf(request);
    if (!metadata) {
      this.logger.warn(
        `Mutating admin route without @AdminAudit: ${method} ${route}`,
      );
    }

    const actionBase = metadata?.action ?? `${method} ${route}`;
    const action = outcome.failed ? `${actionBase}.failed` : actionBase;
    const actorUserId = request.admin?.userId ?? request.user?.sub;
    if (!actorUserId) {
      throw new Error('Admin audit requires an authenticated actor');
    }

    try {
      await this.audit.record({
        actorUserId,
        actorEmail: request.admin?.email,
        action,
        targetType: metadata?.targetType,
        targetId: targetIdOf(request, metadata),
        reason: request.adminAudit?.reason,
        before: request.adminAudit?.before,
        after: outcome.failed
          ? { error: errorLabel(outcome.error) }
          : request.adminAudit?.after,
        ip: request.ip,
        userAgent: headerValue(request, 'user-agent'),
      });
    } catch (auditError: unknown) {
      if (!outcome.failed) throw auditError;
      this.logger.error(
        `Admin audit insert failed for ${action}: ${errorMessage(auditError)}`,
      );
      throw outcome.error;
    }

    if (outcome.failed) throw outcome.error;
    return outcome.body;
  }
}

function routeOf(request: Request): string {
  const pattern = request.route?.path;
  if (typeof pattern === 'string') {
    return `${request.baseUrl ?? ''}${pattern}`;
  }
  const raw = request.path ?? request.url ?? '';
  const queryAt = raw.indexOf('?');
  return queryAt === -1 ? raw : raw.slice(0, queryAt);
}

function targetIdOf(
  request: Request,
  metadata: AdminAuditMetadata | undefined,
): string | undefined {
  if (request.adminAudit?.targetId !== undefined) {
    return request.adminAudit.targetId;
  }
  const name = metadata?.targetParam;
  if (!name) return undefined;
  const value = request.params?.[name];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function headerValue(request: Request, name: string): string | undefined {
  const value = request.headers[name];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function errorLabel(error: unknown): string {
  if (error instanceof DomainException) return error.code;
  if (error instanceof Error && error.name) return error.name;
  return 'Error';
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
