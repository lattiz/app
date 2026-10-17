import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TENANT_PLANS, type TenantPlan } from '../tenants/admin-tenants.dto';

export const TEMPLATE_TIERS = ['basic', 'pro'] as const;
export const TEMPLATE_STATUSES = ['pending', 'active'] as const;

export type TemplateTier = (typeof TEMPLATE_TIERS)[number];
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export class AdminTemplateListQueryDto {
  @ApiPropertyOptional({ enum: TEMPLATE_TIERS })
  @IsOptional()
  @IsIn(TEMPLATE_TIERS)
  tier?: TemplateTier;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  /** Inactive templates are pending until a later phase adds retired_at. */
  @ApiPropertyOptional({ enum: TEMPLATE_STATUSES })
  @IsOptional()
  @IsIn(TEMPLATE_STATUSES)
  status?: TemplateStatus;

  /** Case-insensitive match on template id or name. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}

export class AdminTemplateUsageDto {
  @ApiProperty()
  tenantsUsing!: number;

  @ApiProperty()
  sitesPublished!: number;

  @ApiProperty()
  payingTenants!: number;

  @ApiProperty()
  trialTenants!: number;

  @ApiProperty()
  archivedCount!: number;
}

export class AdminTemplateListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ type: String, nullable: true })
  category!: string | null;

  @ApiProperty({ enum: TEMPLATE_TIERS })
  tier!: TemplateTier;

  @ApiProperty({ enum: TEMPLATE_STATUSES })
  status!: TemplateStatus;

  @ApiProperty({ type: String, nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  previewUrl!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: AdminTemplateUsageDto })
  usage!: AdminTemplateUsageDto;
}

export class AdminTemplateListResponseDto {
  @ApiProperty({ type: [AdminTemplateListItemDto] })
  items!: AdminTemplateListItemDto[];
}

export class AdminTemplateTenantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: TENANT_PLANS })
  plan!: TenantPlan;

  @ApiProperty()
  entitled!: boolean;

  @ApiProperty()
  published!: boolean;
}

export class AdminTemplateDetailDto extends AdminTemplateListItemDto {
  /** Sections on the first GrapesJS page. The project JSON is not returned. */
  @ApiProperty()
  sectionCount!: number;

  @ApiProperty({ type: [AdminTemplateTenantDto] })
  tenants!: AdminTemplateTenantDto[];
}
