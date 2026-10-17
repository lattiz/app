import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { DnsProviderName } from '../../domains/domain/dns-provider.port';
import type {
  RegistrarAutoRenew,
  RegistrarLifecycleStatus,
} from '../../domains/domain/registrar.port';
import {
  DNS_STATUSES,
  DOMAIN_RENEWAL_PAY_BLOCKED_REASONS,
  DOMAIN_RENEWAL_STATUSES,
  DOMAIN_SOURCES,
  type DnsStatus,
  type DomainRenewalPayBlockedReason,
  type DomainRenewalStatusValue,
  type DomainSourceValue,
} from '../../domains/dto/domains.response.dto';

const REGISTRAR_STATUSES = [
  'active',
  'expired',
  'pending',
  'unknown',
] as const satisfies readonly RegistrarLifecycleStatus[];

const AUTO_RENEW = ['on', 'off', 'default'] as const satisfies readonly RegistrarAutoRenew[];

const DNS_PROVIDERS = ['cloudflare', 'openprovider'] as const satisfies readonly DnsProviderName[];

const CYCLE_STATUSES = [
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

export class AdminDomainQueryDto {
  /** `1` skips the 5-minute cache and reads the providers again. */
  @ApiPropertyOptional({ enum: ['1'] })
  @IsOptional()
  @IsIn(['1'])
  refresh?: '1';
}

export class AdminDomainRecordDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: DOMAIN_SOURCES })
  source!: DomainSourceValue;

  @ApiProperty({ type: String, nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ enum: DNS_STATUSES })
  dnsStatus!: DnsStatus;

  @ApiProperty({ enum: DNS_PROVIDERS, nullable: true })
  dnsProvider!: DnsProviderName | null;

  @ApiProperty({ type: String, nullable: true })
  dnsActivationCheckedAt!: string | null;

  @ApiProperty()
  vercelMapped!: boolean;

  @ApiProperty()
  sslActive!: boolean;

  @ApiProperty({ type: String, nullable: true })
  suspendedAt!: string | null;

  @ApiProperty()
  isMock!: boolean;

  @ApiProperty({ type: String, nullable: true })
  purchaseCompletedAt!: string | null;
}

export class AdminDomainCycleDto {
  @ApiProperty({ enum: CYCLE_STATUSES })
  status!: string;

  @ApiProperty({ type: Number, nullable: true })
  amountCents!: number | null;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ type: String, nullable: true })
  openedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  paidAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  renewedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  overdueAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  lapsedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastError!: string | null;
}

export class AdminDomainCurrentCycleDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty({ enum: DOMAIN_RENEWAL_STATUSES })
  status!: DomainRenewalStatusValue;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty({ type: String, nullable: true })
  lateDeadlineAt!: string | null;

  @ApiProperty()
  baseCents!: number;

  @ApiProperty()
  taxCents!: number;

  @ApiProperty()
  totalCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  canPay!: boolean;

  @ApiProperty({
    enum: [...DOMAIN_RENEWAL_PAY_BLOCKED_REASONS, null],
    nullable: true,
  })
  payBlockedReason!: DomainRenewalPayBlockedReason | null;
}

/** Managed schedule, or `{ managedBy: 'customer' }` when the tenant brought the domain. */
export class AdminDomainRenewalDto {
  @ApiPropertyOptional({ enum: ['customer'] })
  managedBy?: 'customer';

  @ApiPropertyOptional({ type: String, nullable: true })
  expiresAt?: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  daysUntilExpiry?: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  paymentOpensAt?: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  daysUntilPaymentOpens?: number | null;

  @ApiPropertyOptional({ type: [String] })
  noticeDates?: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  lateDeadlineAt?: string | null;

  @ApiPropertyOptional({ type: AdminDomainCurrentCycleDto, nullable: true })
  currentCycle?: AdminDomainCurrentCycleDto | null;

  @ApiPropertyOptional({ type: [AdminDomainCycleDto] })
  cycles?: AdminDomainCycleDto[];

  /** Annual fee including IVA, in cents. */
  @ApiPropertyOptional()
  expectedChargeCents?: number;

  @ApiPropertyOptional()
  currency?: string;

  @ApiPropertyOptional()
  firstYearIncluded?: boolean;
}

export class AdminDomainRegistrarDto {
  @ApiPropertyOptional({ enum: ['unavailable'] })
  error?: 'unavailable';

  @ApiPropertyOptional({ enum: REGISTRAR_STATUSES })
  status?: RegistrarLifecycleStatus;

  @ApiPropertyOptional({ type: String, nullable: true })
  renewalDate?: string | null;

  @ApiPropertyOptional()
  canRenew?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  restorableUntil?: string | null;

  @ApiPropertyOptional({ enum: AUTO_RENEW })
  autoRenew?: RegistrarAutoRenew;

  @ApiPropertyOptional()
  expiryMismatch?: boolean;
}

export class AdminDomainDnsRecordDto {
  @ApiProperty()
  type!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty({ type: Boolean, nullable: true })
  proxied!: boolean | null;
}

export class AdminDomainDnsDto {
  @ApiPropertyOptional({ enum: ['unavailable'] })
  error?: 'unavailable';

  @ApiPropertyOptional()
  exists?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  zoneId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  status?: string | null;

  @ApiPropertyOptional({ type: [String] })
  nameservers?: string[];

  @ApiPropertyOptional({ type: [String] })
  originalNameservers?: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  activatedOn?: string | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  paused?: boolean | null;

  @ApiPropertyOptional({ type: [AdminDomainDnsRecordDto] })
  records?: AdminDomainDnsRecordDto[];

  @ApiPropertyOptional()
  recordsMatchVercel?: boolean;
}

export class AdminDomainVercelDto {
  @ApiPropertyOptional({ enum: ['unavailable'] })
  error?: 'unavailable';

  @ApiPropertyOptional()
  inProject?: boolean;

  @ApiPropertyOptional()
  configured?: boolean;
}

export class AdminDomainInspectionDto {
  @ApiProperty({ type: AdminDomainRecordDto, nullable: true })
  domain!: AdminDomainRecordDto | null;

  @ApiProperty({ type: AdminDomainRenewalDto, nullable: true })
  renewal!: AdminDomainRenewalDto | null;

  @ApiProperty({ type: AdminDomainRegistrarDto, nullable: true })
  registrar!: AdminDomainRegistrarDto | null;

  @ApiProperty({ type: AdminDomainDnsDto, nullable: true })
  dns!: AdminDomainDnsDto | null;

  @ApiProperty({ type: AdminDomainVercelDto, nullable: true })
  vercel!: AdminDomainVercelDto | null;
}
