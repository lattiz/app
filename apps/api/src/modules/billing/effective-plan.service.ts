import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import Stripe from 'stripe';
import { type Database, DATABASE } from '../../database/database.module';
import { resolveEffectivePlan } from '../domains/domain/domain-pricing.policy';
import { STRIPE_CLIENT } from './stripe.provider';
import { SubscriptionStateService } from './subscription-state.service';

/**
 * The plan domain rules use: the lower of `tenants.plan` and a scheduled change,
 * so a Pro tenant with a pending downgrade cannot buy a Pro-only domain first.
 */
@Injectable()
export class EffectivePlanService {
  private readonly logger = new Logger(EffectivePlanService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly state: SubscriptionStateService,
  ) {}

  /** `storedPlan` is `tenants.plan`; only Pro can be lowered, so only Pro reads Stripe. */
  async effectivePlanFor(
    tenantId: string,
    storedPlan: string | null,
  ): Promise<string | null> {
    if (storedPlan !== 'pro') return storedPlan;
    try {
      const rows = (await this.db.execute(
        sql`SELECT stripe_subscription_id FROM public.subscriptions
            WHERE tenant_id = ${tenantId}::uuid
            ORDER BY created_at DESC
            LIMIT 1`,
      )) as unknown as { stripe_subscription_id: string }[];
      const subscriptionId = rows[0]?.stripe_subscription_id;
      if (!subscriptionId) return storedPlan;

      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      const schedule = await this.state.readSchedule(subscription, 'pro');
      const futurePlan =
        schedule.kind === 'pending'
          ? schedule.targetPlan
          : schedule.kind === 'foreign'
            ? schedule.futurePlan
            : null;
      return resolveEffectivePlan(storedPlan, futurePlan);
    } catch (err) {
      this.logger.warn(
        `Effective plan for tenant ${tenantId} falls back to basico (Stripe unreachable): ${err instanceof Error ? err.message : String(err)}`,
      );
      return 'basico';
    }
  }
}
