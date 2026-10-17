import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { PreviewState } from '../../../common/billing/preview-capability';
import { AnalyticsReportDto } from '../../analytics/dto/analytics.response.dto';
import { AdminStorageUsageDto } from '../storage/storage-usage.dto';

export const TENANT_PLANS = ['none', 'basico', 'pro', 'trial'] as const;
export const TENANT_STATUSES = ['active', 'inactive', 'cancelled'] as const;
export const TENANT_SORTS = [
  'created_at',
  'last_sign_in_at',
  'domain_expires_at',
] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;

export const PREVIEW_STATES = [
  'paid',
  'trial_unstarted',
  'trial_active',
  'trial_expired',
  'lapsed',
] as const satisfies readonly PreviewState[];

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

export const BILLING_PERIODS = ['monthly', 'annual'] as const;
export const SUBSCRIPTION_PLANS = ['basico', 'pro'] as const;
export const SITE_STATUSES = ['draft', 'published'] as const;
export const DNS_STATUSES = [
  'pending',
  'configuring',
  'propagating',
  'active',
  'error',
] as const;
export const DOMAIN_SOURCES = ['lattiz_managed', 'user_provided'] as const;
export const RENEWAL_STATUSES = [
  'pricing_pending',
  'open',
  'overdue',
  'paid',
  'renewed',
  'renewal_failed',
  'over_cap',
  'lapsed',
  'refunded',
  'void',
] as const;
export const PROVISIONING_STATUSES = [
  'pending',
  'provisioning',
  'ready',
  'failed',
] as const;

export type TenantPlan = (typeof TENANT_PLANS)[number];
export type TenantStatus = (typeof TENANT_STATUSES)[number];

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

export class AdminTenantListQueryDto {
  /** Case-insensitive match on email, slug, name, or domain. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: TENANT_PLANS })
  @IsOptional()
  @IsIn(TENANT_PLANS)
  plan?: TenantPlan;

  @ApiPropertyOptional({ enum: TENANT_STATUSES })
  @IsOptional()
  @IsIn(TENANT_STATUSES)
  status?: TenantStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(queryBoolean)
  @IsBoolean()
  entitled?: boolean;

  /**
   * Internal tenants are excluded unless this is true, which lifts the exclusion.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(queryBoolean)
  @IsBoolean()
  internal?: boolean;

  /** Domain expires within this many days from now. */
  @ApiPropertyOptional({ minimum: 1, maximum: 3650 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(3650)
  domainExpiringDays?: number;

  /** Latest non-void maintenance cycle is `overdue` (or is not, when false). */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(queryBoolean)
  @IsBoolean()
  renewalOverdue?: boolean;

  /** true: dns_status is set and not active. false: dns_status is active. */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(queryBoolean)
  @IsBoolean()
  dnsIssue?: boolean;

  @ApiPropertyOptional({ enum: TENANT_SORTS, default: 'created_at' })
  @IsOptional()
  @IsIn(TENANT_SORTS)
  sort?: (typeof TENANT_SORTS)[number];

  @ApiPropertyOptional({ enum: SORT_ORDERS, default: 'desc' })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order?: (typeof SORT_ORDERS)[number];

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

export class AdminTenantSubscriptionSummaryDto {
  @ApiProperty({ enum: SUBSCRIPTION_STATUSES })
  status!: (typeof SUBSCRIPTION_STATUSES)[number];

  @ApiProperty({ enum: SUBSCRIPTION_PLANS })
  plan!: (typeof SUBSCRIPTION_PLANS)[number];

  @ApiProperty({ enum: BILLING_PERIODS })
  billingPeriod!: (typeof BILLING_PERIODS)[number];

  @ApiProperty({ type: String, nullable: true })
  currentPeriodEnd!: string | null;

  /** When the subscription is scheduled to end; null if it is not. */
  @ApiProperty({ type: String, nullable: true })
  cancelAt!: string | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;
}

export class AdminTenantTemplateRefDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;
}

export class AdminTenantDomainSummaryDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ enum: DNS_STATUSES })
  dnsStatus!: (typeof DNS_STATUSES)[number];
}

export class AdminTenantListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  email!: string | null;

  @ApiProperty({ enum: TENANT_PLANS })
  plan!: TenantPlan;

  @ApiProperty({ enum: TENANT_STATUSES })
  status!: TenantStatus;

  @ApiProperty()
  entitled!: boolean;

  @ApiProperty({ enum: PREVIEW_STATES })
  previewState!: PreviewState;

  @ApiProperty({ type: String, nullable: true })
  previewExpiresAt!: string | null;

  @ApiProperty({ type: AdminTenantSubscriptionSummaryDto, nullable: true })
  subscription!: AdminTenantSubscriptionSummaryDto | null;

  @ApiProperty({ type: AdminTenantTemplateRefDto, nullable: true })
  template!: AdminTenantTemplateRefDto | null;

  @ApiProperty()
  published!: boolean;

  @ApiProperty({ type: AdminTenantDomainSummaryDto, nullable: true })
  domain!: AdminTenantDomainSummaryDto | null;

  /** Sum of asset and branding bytes, or null when never measured. */
  @ApiProperty({ type: Number, nullable: true })
  storageBytes!: number | null;

  @ApiProperty()
  isInternal!: boolean;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: String, nullable: true })
  lastSignInAt!: string | null;
}

export class AdminTenantListResponseDto {
  @ApiProperty({ type: [AdminTenantListItemDto] })
  items!: AdminTenantListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class AdminTenantOverviewDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: TENANT_PLANS })
  plan!: TenantPlan;

  @ApiProperty({ enum: TENANT_STATUSES })
  status!: TenantStatus;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: String, nullable: true })
  previewStartedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  includedDomainUsedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  stripeCustomerId!: string | null;

  @ApiProperty({ type: String, nullable: true })
  email!: string | null;

  @ApiProperty({ type: String, nullable: true })
  emailConfirmedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastSignInAt!: string | null;

  @ApiProperty()
  isInternal!: boolean;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty()
  entitled!: boolean;

  @ApiProperty({ type: String, nullable: true })
  subscriptionId!: string | null;

  @ApiProperty({ enum: [...SUBSCRIPTION_STATUSES, null], nullable: true })
  subscriptionStatus!: (typeof SUBSCRIPTION_STATUSES)[number] | null;

  @ApiProperty({ enum: [...SUBSCRIPTION_PLANS, null], nullable: true })
  subscriptionPlan!: (typeof SUBSCRIPTION_PLANS)[number] | null;

  @ApiProperty({ enum: [...BILLING_PERIODS, null], nullable: true })
  billingPeriod!: (typeof BILLING_PERIODS)[number] | null;

  @ApiProperty({ type: String, nullable: true })
  currentPeriodEnd!: string | null;

  @ApiProperty({ type: Boolean, nullable: true })
  cancelAtPeriodEnd!: boolean | null;

  @ApiProperty({ type: String, nullable: true })
  cancelAt!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  paymentAttempts!: number | null;

  @ApiProperty({ type: String, nullable: true })
  subscriptionCreatedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  templateId!: string | null;

  @ApiProperty({ enum: [...SITE_STATUSES, null], nullable: true })
  siteStatus!: (typeof SITE_STATUSES)[number] | null;

  @ApiProperty({ type: String, nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  siteUpdatedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  domain!: string | null;

  @ApiProperty({ enum: [...DOMAIN_SOURCES, null], nullable: true })
  domainSource!: (typeof DOMAIN_SOURCES)[number] | null;

  @ApiProperty({ enum: [...DNS_STATUSES, null], nullable: true })
  dnsStatus!: (typeof DNS_STATUSES)[number] | null;

  @ApiProperty({ type: String, nullable: true })
  domainExpiresAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  domainSuspendedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  dnsProvider!: string | null;

  @ApiProperty({ enum: [...RENEWAL_STATUSES, null], nullable: true })
  renewalStatus!: (typeof RENEWAL_STATUSES)[number] | null;

  @ApiProperty({ type: String, nullable: true })
  renewalLateDeadlineAt!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  storageBytes!: number | null;

  @ApiProperty({ type: String, nullable: true })
  storageMeasuredAt!: string | null;
}

export class AdminTenantIdentityDto {
  @ApiProperty({ type: String, nullable: true })
  email!: string | null;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty({ type: String, nullable: true })
  lastSignInAt!: string | null;

  /** Values of `auth.users.raw_app_meta_data.providers`. */
  @ApiProperty({ type: [String] })
  providers!: string[];

  /** When the auth user was created. */
  @ApiProperty({ type: String, nullable: true })
  createdAt!: string | null;
}

export class AdminTenantSiteDto {
  @ApiProperty({ type: AdminTenantTemplateRefDto, nullable: true })
  template!: AdminTenantTemplateRefDto | null;

  @ApiProperty({ enum: [...SITE_STATUSES, null], nullable: true })
  status!: (typeof SITE_STATUSES)[number] | null;

  @ApiProperty()
  published!: boolean;

  @ApiProperty({ type: String, nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  updatedAt!: string | null;

  /** `{scheme}://{slug}.{PREVIEW_BASE_DOMAIN}` via `previewUrl`. */
  @ApiProperty()
  previewUrl!: string;

  /** `https://{domain}` when dns_status is active. */
  @ApiProperty({ type: String, nullable: true })
  customDomainUrl!: string | null;
}

export class AdminTemplateArchiveDto {
  @ApiProperty({ type: String, nullable: true })
  templateId!: string | null;

  @ApiProperty()
  reason!: string;

  @ApiProperty()
  archivedAt!: string;
}

export class AdminTenantSubscriptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  stripeSubscriptionId!: string;

  @ApiProperty({ enum: SUBSCRIPTION_STATUSES })
  status!: (typeof SUBSCRIPTION_STATUSES)[number];

  @ApiProperty({ enum: SUBSCRIPTION_PLANS })
  plan!: (typeof SUBSCRIPTION_PLANS)[number];

  @ApiProperty({ enum: BILLING_PERIODS })
  billingPeriod!: (typeof BILLING_PERIODS)[number];

  @ApiProperty({ type: String, nullable: true })
  currentPeriodStart!: string | null;

  @ApiProperty({ type: String, nullable: true })
  currentPeriodEnd!: string | null;

  @ApiProperty({ type: String, nullable: true })
  cancelAt!: string | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiProperty({ type: String, nullable: true })
  canceledAt!: string | null;

  @ApiProperty()
  paymentAttempts!: number;

  @ApiProperty()
  createdAt!: string;
}

export class AdminTenantAnalyticsDto {
  @ApiProperty({ enum: [...PROVISIONING_STATUSES, null], nullable: true })
  provisioningStatus!: (typeof PROVISIONING_STATUSES)[number] | null;

  @ApiProperty({ type: Boolean, nullable: true })
  isMock!: boolean | null;

  @ApiProperty({ type: String, nullable: true })
  fetchedAt!: string | null;

  /** Cached report jsonb, same shape as the tenant analytics report. */
  @ApiProperty({ type: AnalyticsReportDto, nullable: true })
  report!: AnalyticsReportDto | null;
}

export class AdminTenantStorageDto {
  @ApiProperty({ type: () => AdminStorageUsageDto, nullable: true })
  usage!: AdminStorageUsageDto | null;

  /**
   * `preview.max_asset_bytes` while the tenant is not paying.
   * Null when entitled, or when the configured cap is 0.
   */
  @ApiProperty({ type: Number, nullable: true })
  assetByteLimit!: number | null;
}

export class AdminTenantEmailDto {
  @ApiProperty()
  kind!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  attempts!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: String, nullable: true })
  sentAt!: string | null;

  /** `last_error` clipped to 200 characters. */
  @ApiProperty({ type: String, nullable: true })
  lastError!: string | null;
}

export class AdminTenantFlagsDto {
  @ApiProperty()
  isInternal!: boolean;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ type: String, nullable: true })
  notes!: string | null;
}

export class AdminTenantDetailDto {
  @ApiProperty({ type: AdminTenantOverviewDto })
  overview!: AdminTenantOverviewDto;

  @ApiProperty({ type: AdminTenantIdentityDto })
  identity!: AdminTenantIdentityDto;

  @ApiProperty({ enum: PREVIEW_STATES })
  previewState!: PreviewState;

  @ApiProperty({ type: String, nullable: true })
  previewExpiresAt!: string | null;

  @ApiProperty({ type: AdminTenantSiteDto })
  site!: AdminTenantSiteDto;

  @ApiProperty({ type: [AdminTemplateArchiveDto] })
  templateHistory!: AdminTemplateArchiveDto[];

  @ApiProperty({ type: [AdminTenantSubscriptionDto] })
  subscriptions!: AdminTenantSubscriptionDto[];

  @ApiProperty({ type: AdminTenantAnalyticsDto, nullable: true })
  analytics!: AdminTenantAnalyticsDto | null;

  @ApiProperty({ type: AdminTenantStorageDto })
  storage!: AdminTenantStorageDto;

  @ApiProperty({ type: [AdminTenantEmailDto] })
  emails!: AdminTenantEmailDto[];

  @ApiProperty({ type: AdminTenantFlagsDto })
  flags!: AdminTenantFlagsDto;
}
