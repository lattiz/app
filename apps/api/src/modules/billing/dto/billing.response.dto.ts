import { ApiProperty } from '@nestjs/swagger';

/** A Stripe-hosted URL the client redirects to (checkout or billing portal). */
export class BillingRedirectResponseDto {
  @ApiProperty()
  url!: string;
}

export class SubscriptionResponseDto {
  @ApiProperty({ enum: ['basico', 'pro'] })
  plan!: 'basico' | 'pro';

  @ApiProperty({ enum: ['monthly', 'annual'] })
  billingPeriod!: 'monthly' | 'annual';

  @ApiProperty({
    enum: [
      'active',
      'trialing',
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid',
      'paused',
    ],
  })
  status!: string;

  @ApiProperty({ type: String, nullable: true })
  currentPeriodEnd!: string | null;

  /** ISO date when the subscription ends, if a cancellation is scheduled; null otherwise. */
  @ApiProperty({ type: String, nullable: true })
  cancelAt!: string | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;
}

export class InvoiceDto {
  @ApiProperty()
  id!: string;

  /** Unix timestamp (seconds). */
  @ApiProperty()
  date!: number;

  /** Amount paid, in cents. */
  @ApiProperty()
  amountPaid!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  periodStart!: number;

  @ApiProperty()
  periodEnd!: number;

  @ApiProperty({ type: String, nullable: true })
  invoicePdf!: string | null;

  @ApiProperty({ type: String, nullable: true })
  hostedInvoiceUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;
}

export class InvoiceListResponseDto {
  @ApiProperty({ type: InvoiceDto, isArray: true })
  invoices!: InvoiceDto[];
}

/** Acknowledgement that a reconciliation pass ran (see the API logs for detail). */
export class ReconcileResponseDto {
  @ApiProperty()
  triggered!: boolean;
}

/** One sellable plan/period as Stripe currently prices it. */
export class PlanPriceDto {
  @ApiProperty({ enum: ['basico', 'pro'] })
  plan!: 'basico' | 'pro';

  @ApiProperty({ enum: ['monthly', 'annual'] })
  period!: 'monthly' | 'annual';

  /** Price per billing period, in cents (minor currency unit). */
  @ApiProperty()
  amount!: number;

  /** ISO 4217, lowercase (e.g. `mxn`). */
  @ApiProperty()
  currency!: string;

  @ApiProperty()
  lookupKey!: string;
}

/** What the tenant's current subscription is actually billed, which may differ from today's catalog. */
export class SubscriptionPriceDto {
  /** Price per billing period, in cents (minor currency unit). */
  @ApiProperty()
  amount!: number;

  /** ISO 4217, lowercase (e.g. `mxn`). */
  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: ['monthly', 'annual'] })
  period!: 'monthly' | 'annual';
}

export class SubscriptionPriceResponseDto {
  /** Null when the tenant has never subscribed. */
  @ApiProperty({ type: SubscriptionPriceDto, nullable: true })
  price!: SubscriptionPriceDto | null;
}
