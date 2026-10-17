import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Matches the CHECK on public.subscriptions.status. */
export const SUBSCRIPTION_STATUSES = [
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused',
] as const;

export const SUBSCRIPTION_PLANS = ['basico', 'pro'] as const;
export const BILLING_PERIODS = ['monthly', 'annual'] as const;
export const PRICE_INTERVALS = ['day', 'week', 'month', 'year'] as const;
export const INVOICE_STATUSES = [
  'draft',
  'open',
  'paid',
  'uncollectible',
  'void',
] as const;
export const SCHEDULE_STATUSES = [
  'not_started',
  'active',
  'completed',
  'released',
  'canceled',
] as const;

export const STRIPE_DETAIL_ERRORS = ['unavailable'] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

function queryNumber({ value }: { value: unknown }): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

function queryBoolean({ value }: { value: unknown }): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value as boolean;
}

function queryStatusList({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = Array.isArray(value) ? value : [value];
  const statuses = raw.flatMap((item) =>
    String(item)
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  );
  return statuses.length > 0 ? statuses : undefined;
}

export class AdminSubscriptionListQueryDto {
  /** Case-insensitive match on email, slug, or tenant name. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  /** Comma-separated statuses from the subscriptions CHECK. */
  @ApiPropertyOptional({
    enum: SUBSCRIPTION_STATUSES,
    isArray: true,
  })
  @IsOptional()
  @Transform(queryStatusList)
  @IsArray()
  @ArrayMaxSize(SUBSCRIPTION_STATUSES.length)
  @IsIn(SUBSCRIPTION_STATUSES, { each: true })
  status?: SubscriptionStatus[];

  @ApiPropertyOptional({ enum: SUBSCRIPTION_PLANS })
  @IsOptional()
  @IsIn(SUBSCRIPTION_PLANS)
  plan?: SubscriptionPlan;

  @ApiPropertyOptional({ enum: BILLING_PERIODS })
  @IsOptional()
  @IsIn(BILLING_PERIODS)
  period?: BillingPeriod;

  /**
   * Scheduled cancellation (`cancel_at` or `cancel_at_period_end`),
   * excluding terminal statuses.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(queryBoolean)
  @IsBoolean()
  cancelScheduled?: boolean;

  /** `payment_attempts > 0` or status `past_due`. */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(queryBoolean)
  @IsBoolean()
  paymentIssues?: boolean;

  /**
   * Internal tenants are excluded unless this is true, which lifts the exclusion.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(queryBoolean)
  @IsBoolean()
  internal?: boolean;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(100_000)
  page?: number;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class AdminSubscriptionTenantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  email!: string | null;
}

export class AdminSubscriptionListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  stripeSubscriptionId!: string;

  @ApiProperty({ type: AdminSubscriptionTenantDto })
  tenant!: AdminSubscriptionTenantDto;

  @ApiProperty({ enum: SUBSCRIPTION_PLANS })
  plan!: SubscriptionPlan;

  @ApiProperty({ enum: BILLING_PERIODS })
  period!: BillingPeriod;

  @ApiProperty({ enum: SUBSCRIPTION_STATUSES })
  status!: SubscriptionStatus;

  @ApiProperty({ type: String, nullable: true })
  currentPeriodEnd!: string | null;

  /** When the subscription is scheduled to end; null if it is not. */
  @ApiProperty({ type: String, nullable: true })
  cancelAt!: string | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiProperty()
  paymentAttempts!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: String, nullable: true })
  canceledAt!: string | null;

  /** Stripe Dashboard link. `/test` when `STRIPE_SECRET_KEY` starts with `sk_test_`. */
  @ApiProperty()
  stripeDashboardUrl!: string;
}

export class AdminSubscriptionListResponseDto {
  @ApiProperty({ type: [AdminSubscriptionListItemDto] })
  items!: AdminSubscriptionListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class AdminSubscriptionDiscountDto {
  @ApiProperty({ type: Number, nullable: true })
  percentOff!: number | null;

  /** Fixed amount in cents when the coupon is not a percent. */
  @ApiProperty({ type: Number, nullable: true })
  amountOff!: number | null;

  @ApiProperty({ type: String, nullable: true })
  currency!: string | null;
}

export class AdminSubscriptionPriceDto {
  @ApiProperty({ type: Number, nullable: true })
  unitAmount!: number | null;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: [...PRICE_INTERVALS, null], nullable: true })
  interval!: (typeof PRICE_INTERVALS)[number] | null;

  @ApiProperty({ type: Number, nullable: true })
  intervalCount!: number | null;

  @ApiProperty({ type: AdminSubscriptionDiscountDto, nullable: true })
  discount!: AdminSubscriptionDiscountDto | null;
}

export class AdminSubscriptionPaymentMethodDto {
  @ApiProperty()
  brand!: string;

  @ApiProperty()
  last4!: string;

  @ApiProperty()
  expMonth!: number;

  @ApiProperty()
  expYear!: number;
}

export class AdminSubscriptionUpcomingInvoiceDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  currency!: string;

  /** Next charge: `next_payment_attempt`, otherwise `due_date`, otherwise `period_end`. */
  @ApiProperty({ type: String, nullable: true })
  date!: string | null;
}

export class AdminSubscriptionSchedulePhaseDto {
  @ApiProperty({ enum: [...SUBSCRIPTION_PLANS, null], nullable: true })
  plan!: SubscriptionPlan | null;

  @ApiProperty()
  priceId!: string;

  @ApiProperty()
  start!: string;

  @ApiProperty()
  end!: string;
}

export class AdminSubscriptionScheduleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SCHEDULE_STATUSES })
  status!: (typeof SCHEDULE_STATUSES)[number];

  @ApiProperty({ type: [AdminSubscriptionSchedulePhaseDto] })
  phases!: AdminSubscriptionSchedulePhaseDto[];
}

export class AdminSubscriptionInvoiceDto {
  @ApiProperty({ type: String, nullable: true })
  number!: string | null;

  @ApiProperty({ enum: [...INVOICE_STATUSES, null], nullable: true })
  status!: (typeof INVOICE_STATUSES)[number] | null;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  createdAt!: string;

  /** `status_transitions.paid_at`. */
  @ApiProperty({ type: String, nullable: true })
  paidAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  hostedInvoiceUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  invoicePdf!: string | null;
}

export class AdminSubscriptionStripeDto {
  @ApiProperty({ enum: SUBSCRIPTION_STATUSES })
  status!: SubscriptionStatus;

  @ApiProperty({ type: AdminSubscriptionPriceDto, nullable: true })
  price!: AdminSubscriptionPriceDto | null;

  @ApiProperty({ type: AdminSubscriptionPaymentMethodDto, nullable: true })
  paymentMethod!: AdminSubscriptionPaymentMethodDto | null;

  @ApiProperty({ type: AdminSubscriptionUpcomingInvoiceDto, nullable: true })
  upcomingInvoice!: AdminSubscriptionUpcomingInvoiceDto | null;

  @ApiProperty({ type: AdminSubscriptionScheduleDto, nullable: true })
  schedule!: AdminSubscriptionScheduleDto | null;

  @ApiProperty({ type: [AdminSubscriptionInvoiceDto] })
  invoices!: AdminSubscriptionInvoiceDto[];
}

export class AdminSubscriptionDetailDto {
  @ApiProperty({ type: AdminSubscriptionListItemDto })
  local!: AdminSubscriptionListItemDto;

  @ApiProperty({ type: AdminSubscriptionStripeDto, nullable: true })
  stripe!: AdminSubscriptionStripeDto | null;

  @ApiProperty({ enum: [...STRIPE_DETAIL_ERRORS, null], nullable: true })
  stripeError!: (typeof STRIPE_DETAIL_ERRORS)[number] | null;
}
