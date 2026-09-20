import { ApiProperty } from '@nestjs/swagger';
import { TenantBrandingDto } from './branding.response.dto';

export class TenantSiteMetaDto {
  @ApiProperty({ type: String, nullable: true })
  templateId!: string | null;

  @ApiProperty({ type: String, nullable: true })
  templateName!: string | null;

  @ApiProperty({ type: String, nullable: true, enum: ['draft', 'published'] })
  siteStatus!: 'draft' | 'published' | null;

  @ApiProperty({ type: String, nullable: true })
  lastPublishedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  updatedAt!: string | null;
}

export class TenantSubscriptionDto {
  @ApiProperty({ type: String, nullable: true, enum: ['basico', 'pro'] })
  plan!: 'basico' | 'pro' | null;

  @ApiProperty({ type: String, nullable: true })
  status!: string | null;

  @ApiProperty({ type: String, nullable: true, enum: ['monthly', 'annual'] })
  billingPeriod!: 'monthly' | 'annual' | null;

  @ApiProperty({ type: String, nullable: true })
  currentPeriodEnd!: string | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;
}

export class TenantDomainDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty({ type: String, enum: ['godaddy_managed', 'user_provided'] })
  source!: 'godaddy_managed' | 'user_provided';

  @ApiProperty({
    type: String,
    enum: ['pending', 'configuring', 'propagating', 'active', 'error'],
  })
  dnsStatus!: 'pending' | 'configuring' | 'propagating' | 'active' | 'error';

  @ApiProperty()
  vercelMapped!: boolean;

  @ApiProperty()
  sslActive!: boolean;

  @ApiProperty()
  isMock!: boolean;

  @ApiProperty({ type: String, nullable: true })
  expiresAt!: string | null;
}

export class TenantMeResponseDto {
  /** `tenants.id` — the id expected by the editor route (`/editor/:tenantId`). */
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  plan!: string;

  @ApiProperty({ enum: ['active', 'inactive', 'cancelled'] })
  status!: 'active' | 'inactive' | 'cancelled';

  @ApiProperty({ type: String, nullable: true })
  domain!: string | null;

  @ApiProperty()
  vercelDomainMapped!: boolean;

  /** Provisioning state of the purchased domain (null until one is bought). */
  @ApiProperty({ type: TenantDomainDto, nullable: true })
  domainStatus!: TenantDomainDto | null;

  @ApiProperty({ type: TenantSiteMetaDto, nullable: true })
  site!: TenantSiteMetaDto | null;

  @ApiProperty({ type: TenantSubscriptionDto, nullable: true })
  subscription!: TenantSubscriptionDto | null;

  /**
   * Whether the tenant may use the service right now. Top-level rather than
   * inside `subscription`, which is null exactly when a tenant has none —
   * the case that most needs the flag. The only value the guard and the
   * frontend trust; never recompute the date math anywhere else.
   */
  @ApiProperty()
  isEntitled!: boolean;

  /** Favicon / social-preview images injected into the published tenant site. */
  @ApiProperty({ type: TenantBrandingDto })
  branding!: TenantBrandingDto;
}
