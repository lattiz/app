import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ type: TenantSiteMetaDto, nullable: true })
  site!: TenantSiteMetaDto | null;
}
