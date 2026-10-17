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
  MinLength,
} from 'class-validator';
import { DELETION_STEP_KEYS } from './tenant-deletion.model';

const JOB_STATUSES = [
  'pending',
  'running',
  'completed',
  'completed_manual',
  'failed',
] as const;

const STEP_STATUSES = [
  'pending',
  'running',
  'done',
  'skipped',
  'manual',
  'failed',
] as const;

function queryNumber({ value }: { value: unknown }): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

export class StartTenantDeletionDto {
  /** Must equal the tenant slug. */
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  confirmSlug!: string;

  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  /** Sends the account-deleted notice. Defaults to true. */
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean;
}

export class TenantDeletionAcceptedDto {
  @ApiProperty()
  jobId!: string;
}

export class DeletionPreviewStripeDto {
  @ApiProperty({ type: String, nullable: true })
  customerId!: string | null;

  @ApiProperty({ type: [String] })
  liveSubscriptionIds!: string[];

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  openInvoices!: number;
}

export class DeletionPreviewDomainDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  source!: string;

  @ApiProperty({ type: String, nullable: true })
  dnsProvider!: string | null;

  @ApiProperty({ type: String, nullable: true })
  dnsZoneId!: string | null;

  @ApiProperty()
  activeDnsProvider!: string;

  @ApiProperty()
  zoneOnActiveProvider!: boolean;

  @ApiProperty({ type: Boolean, nullable: true })
  vercelInProject!: boolean | null;

  @ApiProperty({ type: String, nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  autoRenew!: string | null;

  @ApiProperty({ type: String, nullable: true })
  renewalDate!: string | null;
}

export class DeletionPreviewAnalyticsDto {
  @ApiProperty({ type: String, nullable: true })
  propertyId!: string | null;

  @ApiProperty()
  isMock!: boolean;
}

export class DeletionPreviewStorageDto {
  @ApiProperty()
  assetsBytes!: number;

  @ApiProperty()
  brandingBytes!: number;

  /** Last measured counts. `usageBytes` does not return an object count. */
  @ApiProperty()
  assetsObjects!: number;

  @ApiProperty()
  brandingObjects!: number;
}

export class DeletionPreviewDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  emailMasked!: string | null;

  @ApiProperty({ type: DeletionPreviewStripeDto })
  stripe!: DeletionPreviewStripeDto;

  @ApiProperty({ type: DeletionPreviewDomainDto, nullable: true })
  domain!: DeletionPreviewDomainDto | null;

  @ApiProperty({ type: DeletionPreviewAnalyticsDto })
  analytics!: DeletionPreviewAnalyticsDto;

  @ApiProperty({ type: DeletionPreviewStorageDto })
  storage!: DeletionPreviewStorageDto;

  @ApiProperty()
  pendingEmails!: number;

  @ApiProperty({ type: [String] })
  warnings!: string[];

  @ApiProperty()
  blocking!: boolean;

  @ApiProperty({ type: [String] })
  whatIsKept!: string[];
}

export class DeletionStepDto {
  @ApiProperty({ enum: DELETION_STEP_KEYS })
  key!: (typeof DELETION_STEP_KEYS)[number];

  @ApiProperty({ enum: STEP_STATUSES })
  status!: (typeof STEP_STATUSES)[number];

  @ApiProperty({ type: String, nullable: true })
  startedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  finishedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  detail!: string | null;

  @ApiProperty({ type: String, nullable: true })
  error!: string | null;
}

export class DeletionDomainSnapshotDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  source!: string;

  @ApiProperty({ type: String, nullable: true })
  registrarDomainId!: string | null;

  @ApiProperty({ type: String, nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  dnsProvider!: string | null;

  @ApiProperty({ type: String, nullable: true })
  dnsZoneId!: string | null;

  @ApiProperty({ type: String, nullable: true })
  autoRenew!: string | null;

  @ApiProperty({ type: String, nullable: true })
  renewalDate!: string | null;

  @ApiProperty({ type: Boolean, nullable: true })
  vercelInProject!: boolean | null;
}

export class DeletionSnapshotDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  emailMasked!: string | null;

  @ApiProperty({ type: DeletionDomainSnapshotDto, nullable: true })
  domain!: DeletionDomainSnapshotDto | null;

  @ApiProperty({ type: String, nullable: true })
  ga4PropertyId!: string | null;

  @ApiProperty()
  analyticsIsMock!: boolean;

  @ApiProperty({ type: String, nullable: true })
  stripeCustomerId!: string | null;

  @ApiProperty({ type: [String] })
  subscriptionIds!: string[];

  @ApiProperty()
  r2Bytes!: number;

  @ApiProperty()
  r2Objects!: number;

  @ApiProperty()
  pendingEmails!: number;
}

export class DeletionJobDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: DeletionSnapshotDto })
  snapshot!: DeletionSnapshotDto;

  @ApiProperty()
  notifyCustomer!: boolean;

  @ApiProperty({ enum: JOB_STATUSES })
  status!: (typeof JOB_STATUSES)[number];

  @ApiProperty({ type: [DeletionStepDto] })
  steps!: DeletionStepDto[];

  @ApiProperty()
  reason!: string;

  @ApiProperty()
  actorUserId!: string;

  @ApiProperty({ type: String, nullable: true })
  actorEmail!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  finishedAt!: string | null;
}

export class DeletionJobListDto {
  @ApiProperty({ type: [DeletionJobDto] })
  items!: DeletionJobDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class DeletionListQueryDto {
  @ApiPropertyOptional({ enum: JOB_STATUSES })
  @IsOptional()
  @IsIn(JOB_STATUSES)
  status?: (typeof JOB_STATUSES)[number];

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
