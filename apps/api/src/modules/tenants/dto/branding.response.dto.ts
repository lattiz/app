import { ApiProperty } from '@nestjs/swagger';

export class BrandingUploadResponseDto {
  /** Public Supabase Storage URL, versioned so a replacement busts the CDN cache. */
  @ApiProperty()
  url!: string;
}

export class TenantBrandingDto {
  @ApiProperty({ type: String, nullable: true })
  faviconLightUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  faviconDarkUrl!: string | null;

  /** Null means the tenant site falls back to the auto-generated OG image. */
  @ApiProperty({ type: String, nullable: true })
  socialPreviewUrl!: string | null;

  /** Null means the tenant site falls back to the tenant name. */
  @ApiProperty({ type: String, nullable: true })
  seoTitle!: string | null;

  /** Null means the tenant site falls back to a generic description. */
  @ApiProperty({ type: String, nullable: true })
  seoDescription!: string | null;

  /** Null means og:site_name falls back to the resolved title. */
  @ApiProperty({ type: String, nullable: true })
  ogSiteName!: string | null;
}
