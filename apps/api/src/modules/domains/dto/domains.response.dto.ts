import { ApiProperty } from '@nestjs/swagger';
import {
  DOMAIN_NOT_COVERED_REASONS,
  type DomainNotCoveredReason,
} from '../domain/domain-pricing.policy';

export { DOMAIN_NOT_COVERED_REASONS, type DomainNotCoveredReason };

export class DomainSearchResultDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty()
  available!: boolean;

  /** True only when the name is free and both the first year and the renewal sit inside the tenant plan caps. */
  @ApiProperty()
  coveredByPlan!: boolean;

  /**
   * Why an available domain is outside the plan: `purchase_over_cap` (first year),
   * `requires_pro` (renewal fits Pro but not this plan), `renewal_over_cap`
   * (renewal above every plan), or `price_unknown` (price could not be read —
   * fail closed). Null when covered or not available.
   */
  @ApiProperty({
    enum: [...DOMAIN_NOT_COVERED_REASONS, null],
    nullable: true,
  })
  notCoveredReason!: DomainNotCoveredReason | null;

  /**
   * True only when this tenant is not on Pro, the name is free, the first year
   * fits the purchase cap, and the renewal fits the Pro cap but not the current plan.
   */
  @ApiProperty()
  availableWithPro!: boolean;

  /** What one renewal year costs Lattiz, in USD cents; null when it was not (or could not be) priced. */
  @ApiProperty({ type: Number, nullable: true })
  renewalPriceUsdCents!: number | null;
}

export class DomainAgreementDto {
  @ApiProperty()
  agreementType!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, nullable: true })
  url!: string | null;
}

export class DomainMaintenanceFeeDto {
  @ApiProperty()
  amountCents!: number;

  /** Lowercase ISO 4217 code, as Stripe uses it. */
  @ApiProperty()
  currency!: string;

  /** IVA en puntos base; el monto no lo incluye. */
  @ApiProperty()
  taxRateBps!: number;
}

export class DomainQuoteResponseDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty()
  available!: boolean;

  @ApiProperty()
  coveredByPlan!: boolean;

  /**
   * Why an available domain is outside the plan: `purchase_over_cap` (first year),
   * `requires_pro` (renewal fits Pro but not this plan), `renewal_over_cap`
   * (renewal above every plan), or `price_unknown` (price could not be read —
   * fail closed). Null when covered or not available.
   */
  @ApiProperty({
    enum: [...DOMAIN_NOT_COVERED_REASONS, null],
    nullable: true,
  })
  notCoveredReason!: DomainNotCoveredReason | null;

  /**
   * True only when this tenant is not on Pro, the name is free, the first year
   * fits the purchase cap, and the renewal fits the Pro cap but not the current plan.
   */
  @ApiProperty()
  availableWithPro!: boolean;

  /** The renewal price the coverage was decided with, in USD cents; null when it was not (or could not be) priced. */
  @ApiProperty({ type: Number, nullable: true })
  renewalPriceUsdCents!: number | null;

  /** Charged every year starting with the second one; the registration itself is covered by the plan. */
  @ApiProperty({ type: DomainMaintenanceFeeDto })
  maintenanceFee!: DomainMaintenanceFeeDto;

  @ApiProperty({ type: [DomainAgreementDto] })
  requiredAgreements!: DomainAgreementDto[];

  @ApiProperty()
  irreversible!: boolean;
}

export const DOMAIN_RENEWAL_STATUSES = [
  'open',
  'overdue',
  'paid',
  'renewal_failed',
] as const;

export type DomainRenewalStatusValue = (typeof DOMAIN_RENEWAL_STATUSES)[number];

export const DOMAIN_RENEWAL_PAY_BLOCKED_REASONS = [
  'subscription_inactive',
  'window_closed',
] as const;

export type DomainRenewalPayBlockedReason =
  (typeof DOMAIN_RENEWAL_PAY_BLOCKED_REASONS)[number];

export class DomainRenewalStatusDto {
  /** Domain name this cycle renews. */
  @ApiProperty()
  domain!: string;

  /** open: pago abierto; overdue: venció y aún puede pagar; paid: pago recibido, renovando; renewal_failed: pago recibido, Lattiz lo está resolviendo. */
  @ApiProperty({ enum: DOMAIN_RENEWAL_STATUSES })
  status!: DomainRenewalStatusValue;

  /** End of the current registration period, as an ISO timestamp. */
  @ApiProperty()
  expiresAt!: string;

  /** Last moment a late payment is still accepted, as an ISO timestamp; null before the domain expires. */
  @ApiProperty({ type: String, nullable: true })
  lateDeadlineAt!: string | null;

  /** Renewal price before IVA, in cents. */
  @ApiProperty()
  baseCents!: number;

  /** IVA in cents. */
  @ApiProperty()
  taxCents!: number;

  /** baseCents plus taxCents. */
  @ApiProperty()
  totalCents!: number;

  /** Lowercase ISO 4217 code. */
  @ApiProperty()
  currency!: string;

  /** True when the tenant can start checkout for this cycle right now. */
  @ApiProperty()
  canPay!: boolean;

  /** Por qué no puede pagar; null si puede o si ya pagó. */
  @ApiProperty({
    enum: [...DOMAIN_RENEWAL_PAY_BLOCKED_REASONS, null],
    nullable: true,
  })
  payBlockedReason!: DomainRenewalPayBlockedReason | null;
}

export class DomainRenewalCheckoutResponseDto {
  /** Stripe Checkout URL for the live renewal cycle. */
  @ApiProperty()
  url!: string;
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
