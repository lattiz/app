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
