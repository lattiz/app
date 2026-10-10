import { TEMPLATE_TIERS } from '../../templates/template-access.policy';
import { ApiProperty } from '@nestjs/swagger';
import {
  PREVIEW_STATES,
  type PreviewState,
} from '../../../common/billing/preview-capability';
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

  /** Set once, at `site_schemas` row creation — lets callers detect edits (`updatedAt !== createdAt`). */
  @ApiProperty({ type: String, nullable: true })
  createdAt!: string | null;
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

  /** ISO date when the subscription ends, if a cancellation is scheduled; null otherwise. */
  @ApiProperty({ type: String, nullable: true })
  cancelAt!: string | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;
}

export class TenantDomainDto {
  @ApiProperty()
  domain!: string;

  @ApiProperty({ type: String, enum: ['lattiz_managed', 'user_provided'] })
  source!: 'lattiz_managed' | 'user_provided';

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

  /** Vercel mapping removed after a lapsed subscription; DNS and ownership are intact. */
  @ApiProperty()
  suspended!: boolean;
}

export class TenantCurrentTemplateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiProperty({ enum: TEMPLATE_TIERS })
  tier!: string;
}

/** The site's template against the tenant's plan, derived on every read (no stored flag). */
export class TenantTemplateAccessDto {
  @ApiProperty({ type: TenantCurrentTemplateDto, nullable: true })
  current!: TenantCurrentTemplateDto | null;

  /**
   * True when an active plan is below the current template's tier (after a
   * downgrade): editing, saving and publishing are blocked until the tenant
   * picks an included template or upgrades. The published site stays online.
   */
  @ApiProperty()
  locked!: boolean;
}

export class TenantMeResponseDto {
  /** `tenants.id` — the id expected by the editor route (`/editor/:tenantId`). */
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  slug!: string;

  /** `https://{slug}.lattiz.app`; serves the published site until a custom domain is live. */
  @ApiProperty()
  previewUrl!: string;

  /** False while the address is still the one generated at signup. */
  @ApiProperty()
  slugIsCustom!: boolean;

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
   * Whether the tenant has a live paid subscription. Top-level rather than
   * inside `subscription`, which is null exactly when a tenant has none —
   * the case that most needs the flag. Derived only from `computeIsEntitled`.
   */
  @ApiProperty()
  isEntitled!: boolean;

  /** `paid` when entitled; trial states are plan `none`; every other non-entitled tenant is `lapsed`. */
  @ApiProperty({ enum: PREVIEW_STATES })
  previewState!: PreviewState;

  /** Publish, asset upload, and template changes. Saving a draft does not depend on this. */
  @ApiProperty()
  canPublish!: boolean;

  /** When the free preview ends. Null for paid, lapsed, and not-yet-published tenants. */
  @ApiProperty({ type: String, nullable: true })
  previewExpiresAt!: string | null;

  /** Favicon / social-preview images injected into the published tenant site. */
  @ApiProperty({ type: TenantBrandingDto })
  branding!: TenantBrandingDto;

  @ApiProperty({ type: TenantTemplateAccessDto })
  templateAccess!: TenantTemplateAccessDto;
}
