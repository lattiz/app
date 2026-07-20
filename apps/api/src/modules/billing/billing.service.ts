import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import Stripe from 'stripe';
import { type Database, DATABASE } from '../../database/database.module';
import {
  type BillingPeriod,
  type BillingPlan,
  lookupKeyFor,
  resolvePlanFromLookupKey,
} from './billing.constants';
import {
  BillingTenantNotFoundException,
  InvalidWebhookSignatureException,
  NoStripeCustomerException,
  PriceNotConfiguredException,
} from './billing.exceptions';
import type { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import type {
  InvoiceListResponseDto,
  SubscriptionResponseDto,
} from './dto/billing.response.dto';
import { STRIPE_CLIENT } from './stripe.provider';

interface TenantRow {
  id: string;
  name: string;
  stripe_customer_id: string | null;
}

interface SubscriptionRow {
  plan: BillingPlan;
  billing_period: BillingPeriod;
  status: string;
  current_period_end: string | Date | null;
  cancel_at_period_end: boolean;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  // ── Checkout ──────────────────────────────────────────────────────────────
  async createCheckoutSession(
    userSub: string,
    dto: CreateCheckoutSessionDto,
    appUrl: string,
  ): Promise<{ url: string }> {
    const lookupKey = lookupKeyFor(dto.plan, dto.period);

    const prices = await this.stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      limit: 1,
    });
    const price = prices.data[0];
    if (!price) throw new PriceNotConfiguredException(lookupKey);

    const tenant = await this.getTenantByUserSub(userSub);
    const customerId = await this.getOrCreateCustomer(tenant, userSub);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      subscription_data: {
        metadata: {
          tenant_id: tenant.id,
          plan: dto.plan,
          period: dto.period,
          lookup_key: lookupKey,
        },
      },
      metadata: { tenant_id: tenant.id },
      success_url: `${appUrl}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/subscription?canceled=true`,
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url };
  }

  // ── Customer portal ───────────────────────────────────────────────────────
  async createPortalSession(
    userSub: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const tenant = await this.getTenantByUserSub(userSub);
    if (!tenant.stripe_customer_id) throw new NoStripeCustomerException();

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  // ── Current subscription ──────────────────────────────────────────────────
  async getSubscriptionForUser(
    userSub: string,
  ): Promise<SubscriptionResponseDto | null> {
    const tenant = await this.getTenantByUserSub(userSub);
    return this.getSubscriptionForTenant(tenant.id);
  }

  async getSubscriptionForTenant(
    tenantId: string,
  ): Promise<SubscriptionResponseDto | null> {
    const rows = await this.query<SubscriptionRow>(
      sql`SELECT plan, billing_period, status, current_period_end, cancel_at_period_end
          FROM public.subscriptions
          WHERE tenant_id = ${tenantId}::uuid
          ORDER BY created_at DESC
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;

    return {
      plan: row.plan,
      billingPeriod: row.billing_period,
      status: row.status,
      currentPeriodEnd: row.current_period_end
        ? toIso(row.current_period_end)
        : null,
      cancelAtPeriodEnd: row.cancel_at_period_end,
    };
  }

  // ── Invoices ──────────────────────────────────────────────────────────────
  async getInvoicesForUser(userSub: string): Promise<InvoiceListResponseDto> {
    const tenant = await this.getTenantByUserSub(userSub);
    if (!tenant.stripe_customer_id) return { invoices: [] };

    const invoices = await this.stripe.invoices.list({
      customer: tenant.stripe_customer_id,
      limit: 12,
      status: 'paid',
    });

    return {
      invoices: invoices.data.map((inv) => ({
        id: inv.id ?? '',
        date: inv.created,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status ?? 'paid',
        periodStart: inv.period_start,
        periodEnd: inv.period_end,
        invoicePdf: inv.invoice_pdf ?? null,
        hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
        description: inv.description ?? inv.lines.data[0]?.description ?? null,
      })),
    };
  }

  // ── Webhook ───────────────────────────────────────────────────────────────
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${String(err)}`);
      throw new InvalidWebhookSignatureException();
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpserted(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        this.logger.log(`Invoice paid: ${event.data.object.id}`);
        break;
      case 'invoice.payment_failed':
        this.logger.warn(`Payment failed: ${event.data.object.id}`);
        break;
      default:
        this.logger.debug(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async onCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const tenantId = session.metadata?.tenant_id;
    if (!tenantId || !session.subscription) {
      this.logger.error('checkout.session.completed: missing tenant/subscription');
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id,
    );
    await this.onSubscriptionUpserted(subscription);
  }

  private async onSubscriptionUpserted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const tenantId = subscription.metadata.tenant_id;
    if (!tenantId) {
      this.logger.error('subscription webhook: missing tenant_id in metadata');
      return;
    }

    const resolved = resolvePlanFromLookupKey(
      subscription.metadata.lookup_key ?? '',
    );
    if (!resolved) {
      this.logger.error(
        `Cannot resolve plan from lookup_key: ${subscription.metadata.lookup_key}`,
      );
      return;
    }

    await this.upsertSubscription(tenantId, subscription, resolved);

    const activePlan = isActiveStatus(subscription.status)
      ? resolved.plan
      : 'none';
    await this.updateTenantPlan(
      tenantId,
      activePlan,
      subscription.customer as string,
    );
    this.logger.log(
      `Tenant ${tenantId}: ${resolved.plan} (${subscription.status})`,
    );
  }

  private async onSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const tenantId = subscription.metadata.tenant_id;
    if (!tenantId) return;

    await this.query(
      sql`UPDATE public.subscriptions
          SET status = 'canceled', canceled_at = now(), cancel_at_period_end = false
          WHERE stripe_subscription_id = ${subscription.id}`,
    );
    await this.updateTenantPlan(
      tenantId,
      'none',
      subscription.customer as string,
    );
    this.logger.log(`Tenant ${tenantId} subscription canceled`);
  }

  // ── DB helpers ────────────────────────────────────────────────────────────
  private async getTenantByUserSub(userSub: string): Promise<TenantRow> {
    const rows = await this.query<TenantRow>(
      sql`SELECT id, name, stripe_customer_id
          FROM public.tenants
          WHERE user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    const row = rows[0];
    if (!row) throw new BillingTenantNotFoundException();
    return row;
  }

  private async getOrCreateCustomer(
    tenant: TenantRow,
    userSub: string,
  ): Promise<string> {
    if (tenant.stripe_customer_id) return tenant.stripe_customer_id;

    const customer = await this.stripe.customers.create({
      name: tenant.name,
      metadata: { tenant_id: tenant.id, user_id: userSub },
    });
    await this.query(
      sql`UPDATE public.tenants
          SET stripe_customer_id = ${customer.id}
          WHERE id = ${tenant.id}::uuid`,
    );
    return customer.id;
  }

  private async upsertSubscription(
    tenantId: string,
    subscription: Stripe.Subscription,
    resolved: { plan: BillingPlan; period: BillingPeriod },
  ): Promise<void> {
    const period = periodBounds(subscription);
    const canceledAt = subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null;

    await this.query(
      sql`INSERT INTO public.subscriptions (
            tenant_id, stripe_subscription_id, stripe_customer_id,
            plan, billing_period, status,
            current_period_start, current_period_end,
            cancel_at_period_end, canceled_at
          ) VALUES (
            ${tenantId}::uuid, ${subscription.id}, ${subscription.customer as string},
            ${resolved.plan}, ${resolved.period}, ${subscription.status},
            ${period.start}, ${period.end},
            ${subscription.cancel_at_period_end}, ${canceledAt}
          )
          ON CONFLICT (stripe_subscription_id) DO UPDATE SET
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            plan = EXCLUDED.plan,
            billing_period = EXCLUDED.billing_period,
            status = EXCLUDED.status,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            cancel_at_period_end = EXCLUDED.cancel_at_period_end,
            canceled_at = EXCLUDED.canceled_at`,
    );
  }

  private async updateTenantPlan(
    tenantId: string,
    plan: BillingPlan | 'none',
    customerId: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.tenants
          SET plan = ${plan}, stripe_customer_id = ${customerId}
          WHERE id = ${tenantId}::uuid`,
    );
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

/** In Stripe's Basil API the billing period lives on subscription items. */
function periodBounds(subscription: Stripe.Subscription): {
  start: string | null;
  end: string | null;
} {
  const item = subscription.items?.data?.[0];
  const start = item?.current_period_start;
  const end = item?.current_period_end;
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  };
}

function isActiveStatus(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing' || status === 'past_due';
}

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
