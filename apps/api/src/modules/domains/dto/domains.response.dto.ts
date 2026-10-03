import { ApiProperty } from '@nestjs/swagger';

export class DomainSearchResultDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty()
  available!: boolean;

  @ApiProperty()
  priceUsdCents!: number;

  /** Whether the Lattiz plan absorbs the cost (price <= DOMAIN_MAX_COST_USD_CENTS). */
  @ApiProperty()
  coveredByPlan!: boolean;
}

export class DomainAgreementDto {
  @ApiProperty()
  agreementType!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, nullable: true })
  url!: string | null;
}

export class DomainQuoteResponseDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty()
  available!: boolean;

  @ApiProperty()
  priceUsdCents!: number;

  @ApiProperty()
  renewalPriceUsdCents!: number;

  @ApiProperty()
  coveredByPlan!: boolean;

  @ApiProperty({ type: [DomainAgreementDto] })
  requiredAgreements!: DomainAgreementDto[];

  @ApiProperty()
  irreversible!: boolean;
}

export class DomainPurchaseResponseDto {
  /** Poll GET /domains/jobs/:jobId with this id for pipeline progress. */
  @ApiProperty()
  jobId!: string;
}

export class RelaunchDomainResponseDto {
  /** False when there was nothing to relaunch (no domain, or not suspended). */
  @ApiProperty()
  relaunched!: boolean;

  @ApiProperty({ type: String, nullable: true })
  domain!: string | null;
}

export class DnsInstructionDto {
  @ApiProperty({ enum: ['A', 'CNAME'] })
  type!: 'A' | 'CNAME';

  /** '@' for the apex, 'www' for the subdomain. */
  @ApiProperty()
  name!: string;

  @ApiProperty()
  value!: string;

  @ApiProperty()
  ttl!: number;
}

export class ConnectDomainResponseDto {
  @ApiProperty()
  jobId!: string;

  /** DNS records the tenant must create manually at their registrar. */
  @ApiProperty({ type: [DnsInstructionDto] })
  dnsInstructions!: DnsInstructionDto[];
}

export const DOMAIN_JOB_STATUSES = [
  'pending',
  'purchasing',
  'configuring_dns',
  'registering_vercel',
  'completed',
  'failed',
] as const;

export type DomainJobStatus = (typeof DOMAIN_JOB_STATUSES)[number];

/**
 * Stable, user-safe reason a job failed; the web maps each code to a message.
 * Technical detail (provider messages, ids) goes to the API logs only.
 */
export const DOMAIN_JOB_ERROR_CODES = [
  'DNS_PROVIDER_UNAVAILABLE',
  'DNS_ZONE_REJECTED',
  'SERVICE_CONFIGURATION_ERROR',
  'REGISTRAR_UNAVAILABLE',
  'REGISTRATION_REJECTED',
  'DOMAIN_NO_LONGER_AVAILABLE',
  'REGISTRATION_PENDING',
  'DNS_SETUP_FAILED',
  'VERCEL_SETUP_FAILED',
  'PURCHASE_INTERRUPTED',
  'UNEXPECTED_ERROR',
] as const;

export type DomainJobErrorCode = (typeof DOMAIN_JOB_ERROR_CODES)[number];

export class DomainJobStatusDto {
  @ApiProperty()
  jobId!: string;

  @ApiProperty()
  domain!: string;

  @ApiProperty({ enum: DOMAIN_JOB_STATUSES })
  status!: DomainJobStatus;

  @ApiProperty({ type: [String] })
  stepsCompleted!: string[];

  /** Set when status is 'failed'. */
  @ApiProperty({ enum: DOMAIN_JOB_ERROR_CODES, nullable: true })
  errorCode!: DomainJobErrorCode | null;

  @ApiProperty({ type: String, nullable: true })
  errorStep!: string | null;
}

export const DNS_STATUSES = [
  'pending',
  'configuring',
  'propagating',
  'active',
  'error',
] as const;

export type DnsStatus = (typeof DNS_STATUSES)[number];

export const DOMAIN_SOURCES = ['lattiz_managed', 'user_provided'] as const;

export type DomainSourceValue = (typeof DOMAIN_SOURCES)[number];

export class DomainStatusResponseDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty({ enum: DOMAIN_SOURCES })
  source!: DomainSourceValue;

  @ApiProperty({ enum: DNS_STATUSES })
  dnsStatus!: DnsStatus;

  @ApiProperty()
  vercelMapped!: boolean;

  @ApiProperty()
  sslActive!: boolean;

  @ApiProperty()
  isMock!: boolean;

  @ApiProperty({ type: String, nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  purchaseCompletedAt!: string | null;
}
