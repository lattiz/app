import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Request } from 'express';
import { computeIsEntitled } from '../billing/entitlement';
import { type Database, DATABASE } from '../../database/database.module';
import { SubscriptionInactiveException } from '../exceptions/subscription-inactive.exception';

interface EntitlementRow {
  status: string | null;
  current_period_end: string | Date | null;
}

/**
 * Gates value-generating endpoints on a live entitlement read. A JWT claim
 * would go stale — tokens are not reissued when a billing event lands — so
 * every call hits the DB. Runs after SupabaseJwtGuard, which sets `req.user`.
 */
@Injectable()
export class SubscriptionActiveGuard implements CanActivate {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userSub = request.user?.sub;
    if (!userSub) throw new SubscriptionInactiveException();

    const rows = (await this.db.execute(
      sql`SELECT s.status, s.current_period_end
          FROM public.tenants t
          LEFT JOIN public.subscriptions s ON s.tenant_id = t.id
          WHERE t.user_id = ${userSub}::uuid
          ORDER BY s.created_at DESC NULLS LAST
          LIMIT 1`,
    )) as unknown as EntitlementRow[];

    const row = rows[0];
    const isEntitled = computeIsEntitled(
      row
        ? { status: row.status, currentPeriodEnd: row.current_period_end }
        : null,
    );
    if (!isEntitled) throw new SubscriptionInactiveException();
    return true;
  }
}
