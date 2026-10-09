import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  type BillingPlan,
  resolvePlanFromLookupKey,
} from './billing.constants';
import { BillingPricesService } from './billing-prices.service';
import { classifySchedule, type ScheduleState } from './plan-change-schedule';
import { STRIPE_CLIENT } from './stripe.provider';
import { type ResolvedPlan, resolvePlanFromPrice } from './subscription-plan';

/** Reads plan and pending-change state from fresh Stripe objects; shared by sync, plan changes and domains. */
@Injectable()
export class SubscriptionStateService {
  private readonly logger = new Logger(SubscriptionStateService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly prices: BillingPricesService,
  ) {}

  /**
   * Item price first (lookup key, then product), subscription metadata only as
   * a last resort: metadata goes stale after a plan change.
   */
  async resolvePlan(
    subscription: Stripe.Subscription,
  ): Promise<ResolvedPlan | null> {
    const items = subscription.items?.data ?? [];
    if (items.length !== 1) return null;
    return (
      (await this.resolvePrice(items[0].price)) ??
      resolvePlanFromLookupKey(subscription.metadata?.lookup_key ?? '')
    );
  }

  /** Reads the attached schedule expanded, so its phase prices can be mapped to plans. */
  async readSchedule(
    subscription: Stripe.Subscription,
    currentPlan: BillingPlan | null,
  ): Promise<ScheduleState> {
    const scheduleId =
      typeof subscription.schedule === 'string'
        ? subscription.schedule
        : subscription.schedule?.id;
    if (!scheduleId) return { kind: 'none' };

    const schedule = await this.stripe.subscriptionSchedules.retrieve(
      scheduleId,
      { expand: ['phases.items.price'] },
    );
    const productPlans = await this.productPlansOrNull();
    return classifySchedule(
      schedule,
      subscription.id,
      currentPlan,
      Math.floor(Date.now() / 1000),
      (price) =>
        typeof price === 'string' || price.deleted
          ? null
          : (resolvePlanFromPrice(price, productPlans)?.plan ?? null),
    );
  }

  async releaseSchedule(scheduleId: string): Promise<void> {
    await this.stripe.subscriptionSchedules.release(scheduleId);
  }

  private async resolvePrice(
    price: Stripe.Price,
  ): Promise<ResolvedPlan | null> {
    return (
      resolvePlanFromPrice(price, null) ??
      resolvePlanFromPrice(price, await this.productPlansOrNull())
    );
  }

  private async productPlansOrNull(): Promise<ReadonlyMap<
    string,
    BillingPlan
  > | null> {
    try {
      return await this.prices.productPlans();
    } catch (err) {
      this.logger.warn(
        `Product→plan catalog unavailable: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }
}
