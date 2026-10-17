import { Inject, Injectable, Logger } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import type Stripe from 'stripe';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { type Database, DATABASE } from '../../../database/database.module';
import { STRIPE_CLIENT } from '../../billing/stripe.provider';
import {
  AdminNotFoundException,
  AdminStripeUnavailableException,
  SubscriptionNotCancelableException,
  SubscriptionNotResumableException,
  SubscriptionScheduleActiveException,
} from '../admin.exceptions';
import type {
  AdminSubscriptionDetailDto,
  AdminSubscriptionListQueryDto,
  AdminSubscriptionListResponseDto,
  AdminSubscriptionStripeDto,
  CancelMode,
} from './admin-subscriptions.dto';
import {
  mapStripeDetail,
  mapSubscriptionItem,
  subscriptionHasUpcomingInvoice,
  type SubscriptionOverviewRow,
} from './admin-subscriptions.mapper';
import {
  subscriptionListStatements,
  subscriptionOverviewStatement,
} from './admin-subscriptions.queries';

export const SUBSCRIPTION_STRIPE_CACHE_TTL_MS = 60_000;
const INVOICE_LIMIT = 24;
const TERMINAL_STATUSES = new Set<Stripe.Subscription.Status>([
  'canceled',
  'incomplete_expired',
]);

export interface SubscriptionAuditState {
  status: string;
  cancelAtPeriodEnd: boolean;
  cancelAt: number | null;
  mode?: CancelMode;
  reason?: string;
}

export interface SubscriptionActionResult {
  before: SubscriptionAuditState;
  after: SubscriptionAuditState;
  detail: AdminSubscriptionDetailDto;
}

export interface CancelSubscriptionInput {
  mode: CancelMode;
  reason: string;
  actorUserId: string;
  auditRequestId: string;
}

const SUBSCRIPTION_EXPAND = [
  'discounts.source.coupon',
  'default_payment_method',
  'customer.invoice_settings.default_payment_method',
];

interface StripeCacheEntry {
  expiresAt: number;
  value: AdminSubscriptionStripeDto;
}

@Injectable()
export class AdminSubscriptionsService {
  private readonly logger = new Logger(AdminSubscriptionsService.name);
  private readonly stripeCache = new Map<string, StripeCacheEntry>();

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
  ) {}

  async list(
    query: AdminSubscriptionListQueryDto,
  ): Promise<AdminSubscriptionListResponseDto> {
    const statements = subscriptionListStatements(query);
    const [rows, totals] = await Promise.all([
      this.query<SubscriptionOverviewRow>(statements.items),
      this.query<{ total: number | string }>(statements.count),
    ]);
    return {
      items: rows.map((row) => mapSubscriptionItem(row)),
      total: Number(totals[0]?.total ?? 0),
      page: statements.page,
      pageSize: statements.pageSize,
    };
  }

  async get(id: string, now = Date.now()): Promise<AdminSubscriptionDetailDto> {
    const rows = await this.query<SubscriptionOverviewRow>(
      subscriptionOverviewStatement(id),
    );
    const row = rows[0];
    if (!row) {
      throw new AdminNotFoundException('No se encontró la suscripción.');
    }
    const stripe = await this.stripeDetail(row, now);
    return {
      local: mapSubscriptionItem(row),
      stripe: stripe.value,
      stripeError: stripe.error,
    };
  }

  async cancel(
    id: string,
    input: CancelSubscriptionInput,
  ): Promise<SubscriptionActionResult> {
    const row = await this.loadRow(id);
    const current = await this.readStripe(row.stripe_subscription_id);
    this.assertCancelable(current);
    const base = `admin-cancel:${row.stripe_subscription_id}:${input.mode}:${input.auditRequestId}`;
    const metadata = {
      admin_actor: input.actorUserId,
      admin_reason: input.reason,
    };
    let updated: Stripe.Subscription;
    try {
      if (input.mode === 'period_end') {
        updated = await this.stripe.subscriptions.update(
          row.stripe_subscription_id,
          { cancel_at_period_end: true, metadata },
          { idempotencyKey: `${base}:period_end` },
        );
      } else {
        await this.stripe.subscriptions.update(
          row.stripe_subscription_id,
          { metadata },
          { idempotencyKey: `${base}:meta` },
        );
        updated = await this.stripe.subscriptions.cancel(
          row.stripe_subscription_id,
          { prorate: false },
          { idempotencyKey: `${base}:cancel` },
        );
      }
    } catch (err) {
      this.forget(row.id);
      this.rethrowStripe(row.id, err);
    }
    this.forget(row.id);
    return {
      before: snapshot(current),
      after: {
        ...snapshot(updated),
        mode: input.mode,
        reason: input.reason,
      },
      detail: await this.get(id),
    };
  }

  async resume(
    id: string,
    requestId: string,
  ): Promise<SubscriptionActionResult> {
    const row = await this.loadRow(id);
    const current = await this.readStripe(row.stripe_subscription_id);
    const params = resumeParams(current);
    let updated: Stripe.Subscription;
    try {
      updated = await this.stripe.subscriptions.update(
        row.stripe_subscription_id,
        params,
        {
          idempotencyKey: `admin-resume:${row.stripe_subscription_id}:${requestId}`,
        },
      );
    } catch (err) {
      this.forget(row.id);
      this.rethrowStripe(row.id, err);
    }
    this.forget(row.id);
    return {
      before: snapshot(current),
      after: snapshot(updated),
      detail: await this.get(id),
    };
  }

  private async stripeDetail(
    row: SubscriptionOverviewRow,
    now: number,
  ): Promise<{
    value: AdminSubscriptionStripeDto | null;
    error: 'unavailable' | null;
  }> {
    const cached = this.stripeCache.get(row.id);
    if (cached && cached.expiresAt > now) {
      return { value: cached.value, error: null };
    }
    try {
      const value = await this.loadStripe(row);
      this.remember(row.id, value, now);
      return { value, error: null };
    } catch (err) {
      this.logger.warn(
        `Stripe detail unavailable for ${row.id}: ${messageOf(err)}`,
      );
      return { value: null, error: 'unavailable' };
    }
  }

  private async loadStripe(
    row: SubscriptionOverviewRow,
  ): Promise<AdminSubscriptionStripeDto> {
    const subscription = await this.stripe.subscriptions.retrieve(
      row.stripe_subscription_id,
      { expand: SUBSCRIPTION_EXPAND },
    );
    const scheduleId = scheduleIdOf(subscription);
    const [invoices, schedule, upcoming] = await Promise.all([
      this.stripe.invoices.list({
        subscription: subscription.id,
        limit: INVOICE_LIMIT,
      }),
      scheduleId
        ? this.stripe.subscriptionSchedules.retrieve(scheduleId, {
            expand: ['phases.items.price'],
          })
        : Promise.resolve(null),
      this.readUpcoming(subscription),
    ]);
    return mapStripeDetail({
      subscription,
      invoices: invoices.data,
      schedule,
      upcoming,
    });
  }

  /**
   * A missing preview (canceled, or Stripe has nothing to bill) leaves the
   * rest of the Stripe payload intact.
   */
  private async readUpcoming(
    subscription: Stripe.Subscription,
  ): Promise<Stripe.Invoice | null> {
    if (!subscriptionHasUpcomingInvoice(subscription)) return null;
    try {
      return await this.stripe.invoices.createPreview({
        subscription: subscription.id,
      });
    } catch (err) {
      this.logger.warn(
        `Upcoming invoice unavailable for ${subscription.id}: ${messageOf(err)}`,
      );
      return null;
    }
  }

  private async loadRow(id: string): Promise<SubscriptionOverviewRow> {
    const rows = await this.query<SubscriptionOverviewRow>(
      subscriptionOverviewStatement(id),
    );
    const row = rows[0];
    if (!row) {
      throw new AdminNotFoundException('No se encontró la suscripción.');
    }
    return row;
  }

  private async readStripe(stripeId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(stripeId);
    } catch (err) {
      this.rethrowStripe(stripeId, err);
    }
  }

  private assertCancelable(subscription: Stripe.Subscription): void {
    if (TERMINAL_STATUSES.has(subscription.status)) {
      throw new SubscriptionNotCancelableException();
    }
    if (scheduleIdOf(subscription)) {
      throw new SubscriptionScheduleActiveException();
    }
  }

  private forget(id: string): void {
    this.stripeCache.delete(id);
  }

  private rethrowStripe(id: string, err: unknown): never {
    if (err instanceof DomainException) throw err;
    this.logger.warn(
      `Stripe subscription action failed for ${id}: ${messageOf(err)}`,
    );
    throw new AdminStripeUnavailableException(
      'Stripe no está disponible para cambiar la suscripción.',
    );
  }

  private remember(
    id: string,
    value: AdminSubscriptionStripeDto,
    now: number,
  ): void {
    for (const [key, entry] of this.stripeCache) {
      if (entry.expiresAt <= now) this.stripeCache.delete(key);
    }
    this.stripeCache.set(id, {
      value,
      expiresAt: now + SUBSCRIPTION_STRIPE_CACHE_TTL_MS,
    });
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function scheduleIdOf(subscription: Stripe.Subscription): string | null {
  if (!subscription.schedule) return null;
  return typeof subscription.schedule === 'string'
    ? subscription.schedule
    : subscription.schedule.id;
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : 'unknown';
}

function snapshot(subscription: Stripe.Subscription): SubscriptionAuditState {
  return {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    cancelAt: subscription.cancel_at ?? null,
  };
}

function resumeParams(
  subscription: Stripe.Subscription,
): Stripe.SubscriptionUpdateParams {
  if (TERMINAL_STATUSES.has(subscription.status)) {
    throw new SubscriptionNotResumableException(
      'La suscripción ya terminó y no se puede reanudar.',
    );
  }
  const params: Stripe.SubscriptionUpdateParams = {};
  if (subscription.cancel_at != null) params.cancel_at = null;
  if (subscription.cancel_at_period_end === true) {
    params.cancel_at_period_end = false;
  }
  if (Object.keys(params).length === 0) {
    throw new SubscriptionNotResumableException(
      'No hay una cancelación programada que se pueda deshacer.',
    );
  }
  return params;
}
