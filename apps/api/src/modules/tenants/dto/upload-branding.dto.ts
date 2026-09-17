import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

/** The three branding slots a tenant can fill; each maps to one `tenants` column. */
export const BRANDING_TYPES = [
  'favicon_light',
  'favicon_dark',
  'social_preview',
] as const;

export type BrandingType = (typeof BRANDING_TYPES)[number];

export class UploadBrandingDto {
  /** Which branding slot the uploaded file fills. */
  @ApiProperty({ enum: BRANDING_TYPES })
  @IsIn(BRANDING_TYPES)
  type!: BrandingType;
}
