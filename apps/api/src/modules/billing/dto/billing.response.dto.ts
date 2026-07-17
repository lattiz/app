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
