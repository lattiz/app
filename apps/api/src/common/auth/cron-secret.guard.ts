import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

/**
 * Authenticates internal scheduler/ops calls with the shared CRON_SECRET,
 * sent as `Authorization: Bearer <secret>`. Not a user identity — never
 * combine with SupabaseJwtGuard. Denies everything while the secret is unset.
 */
@Injectable()
export class CronSecretGuard implements CanActivate {
  private readonly logger = new Logger(CronSecretGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.CRON_SECRET?.trim();
    if (!expected) {
      this.logger.warn(
        'CRON_SECRET is not set — internal endpoints are disabled.',
      );
      throw new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, provided] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !provided || !secretsMatch(provided, expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

/** Hashing first gives equal-length buffers, so timingSafeEqual never leaks the length. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
