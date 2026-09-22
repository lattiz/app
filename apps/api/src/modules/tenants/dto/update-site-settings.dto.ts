import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Hard ceilings only — the recommended SEO lengths are soft hints in the UI.
 * An omitted field is left unchanged; an empty string clears it.
 */
export class UpdateSiteSettingsDto {
  @ApiPropertyOptional({ maxLength: 70 })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  title?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ogSiteName?: string;
}
