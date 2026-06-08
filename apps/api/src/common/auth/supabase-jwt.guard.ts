import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import type { AuthenticatedUser } from './authenticated-user';

/** Verifies Supabase JWTs locally via JWKS (ES256 only — HS256 legacy secret intentionally rejected). */
@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseJwtGuard.name);
  private static readonly AUDIENCE = 'authenticated';
  private static readonly ALGORITHMS = ['ES256'];

  /** Lazy — created on first request, then reused. */
  private jwks?: JWTVerifyGetKey;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const jwks = this.resolveJwks();
    if (!jwks) {
      // SUPABASE_URL not set — cannot verify.
      throw new UnauthorizedException(
        'Auth is not configured (SUPABASE_URL is missing).',
      );
    }

    try {
      const { payload } = await jwtVerify(token, jwks, {
        audience: SupabaseJwtGuard.AUDIENCE,
        algorithms: SupabaseJwtGuard.ALGORITHMS,
        issuer: this.issuer(),
      });

      if (!payload.sub) {
        throw new UnauthorizedException('Token has no subject.');
      }

      const user: AuthenticatedUser = { sub: payload.sub, claims: payload };
      request.user = user;
      return true;
    } catch (error) {
      this.logger.debug(
        `JWT verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header) return undefined;
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : undefined;
  }

  private resolveJwks(): JWTVerifyGetKey | undefined {
    if (this.jwks) return this.jwks;
    const url = this.jwksUrl();
    if (!url) return undefined;
    this.jwks = createRemoteJWKSet(new URL(url));
    return this.jwks;
  }

  private jwksUrl(): string | undefined {
    const explicit = process.env.SUPABASE_JWKS_URL?.trim();
    if (explicit) return explicit;
    const base = this.supabaseBaseUrl();
    return base ? `${base}/auth/v1/.well-known/jwks.json` : undefined;
  }

  private issuer(): string | undefined {
    const base = this.supabaseBaseUrl();
    return base ? `${base}/auth/v1` : undefined;
  }

  private supabaseBaseUrl(): string | undefined {
    const raw = process.env.SUPABASE_URL?.trim();
    return raw ? raw.replace(/\/$/, '') : undefined;
  }
}
