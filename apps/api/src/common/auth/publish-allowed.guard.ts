import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Request } from 'express';
import { type Database, DATABASE } from '../../database/database.module';
import { computeIsEntitled } from '../billing/entitlement';
import { PreviewCapabilityService } from '../billing/preview-capability.service';
import { PreviewConfig } from '../billing/preview.config';
import { EmailNotVerifiedException } from '../exceptions/email-not-verified.exception';
import { PreviewExpiredException } from '../exceptions/preview-expired.exception';
import { SubscriptionInactiveException } from '../exceptions/subscription-inactive.exception';

interface PreviewAccessRow {
  plan: string;
  preview_started_at: string | Date | null;
  status: string | null;
  current_period_end: string | Date | null;
  email_confirmed_at: string | Date | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by PublishAllowedGuard so the preview rate limit can skip paid tenants. */
      previewAccess?: { isEntitled: boolean };
    }
  }
}

/**
 * Publish, asset upload, and template changes. Draft saves do not use this
 * guard. Runs after SupabaseJwtGuard, which sets `req.user`.
 */
@Injectable()
export class PublishAllowedGuard implements CanActivate {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly preview: PreviewCapabilityService,
    private readonly settings: PreviewConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userSub = request.user?.sub;
    if (!userSub) throw new SubscriptionInactiveException();

    // email_confirmed_at is not a JWT claim; the API role can SELECT auth.users.
    const rows = (await this.db.execute(
      sql`SELECT t.plan, t.preview_started_at, s.status, s.current_period_end,
                 u.email_confirmed_at
          FROM public.tenants t
          LEFT JOIN public.subscriptions s ON s.tenant_id = t.id
          LEFT JOIN auth.users u ON u.id = t.user_id
          WHERE t.user_id = ${userSub}::uuid
          ORDER BY s.created_at DESC NULLS LAST
          LIMIT 1`,
    )) as unknown as PreviewAccessRow[];

    const row = rows[0];
    const isEntitled = computeIsEntitled(
      row?.status
        ? { status: row.status, currentPeriodEnd: row.current_period_end }
        : null,
    );
    request.previewAccess = { isEntitled };
    const capability = this.preview.evaluate({
      isEntitled,
      plan: row?.plan ?? '',
      previewStartedAt: row?.preview_started_at ?? null,
    });
    if (!capability.canPublish) {
      if (this.preview.enabled && capability.state === 'trial_expired') {
        throw new PreviewExpiredException();
      }
      throw new SubscriptionInactiveException();
    }
    if (
      !isEntitled &&
      this.settings.requireVerifiedEmail &&
      !emailIsVerified(row?.email_confirmed_at)
    ) {
      throw new EmailNotVerifiedException();
    }
    return true;
  }
}

function emailIsVerified(value: string | Date | null | undefined): boolean {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  return typeof value === 'string' && value.trim() !== '';
}
