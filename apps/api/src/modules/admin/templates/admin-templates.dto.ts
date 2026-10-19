import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TENANT_PLANS, type TenantPlan } from '../tenants/admin-tenants.dto';

export const TEMPLATE_TIERS = ['basic', 'pro'] as const;
export const TEMPLATE_STATUSES = ['pending', 'active', 'retired'] as const;

export type TemplateTier = (typeof TEMPLATE_TIERS)[number];
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

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

  /** `pending` is inactive and not retired. */
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

  /** Exact tag. Tags are stored in lowercase. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(24)
  @Matches(SLUG)
  tag?: string;
}

export class AdminTemplateUpdateDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 80 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  @Matches(SLUG)
  category?: string;

  @ApiPropertyOptional({ type: [String], maxItems: 10 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(24, { each: true })
  @Matches(SLUG, { each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class AdminTemplateRetireDto {
  @ApiProperty({ minLength: 3, maxLength: 300 })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason!: string;
}

export class AdminTemplateReorderDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  ids!: string[];
}

export class AdminTemplateReorderResponseDto {
  @ApiProperty({ type: [String] })
  ids!: string[];
}

export class AdminTemplateDeleteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  confirmId!: string;
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

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty()
  featured!: boolean;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  retiredAt!: string | null;

  @ApiProperty({
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  kitMeta!: Record<string, unknown> | null;

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
