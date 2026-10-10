import { ApiProperty } from '@nestjs/swagger';
import {
  TEMPLATE_LOCK_REASONS,
  TEMPLATE_TIERS,
  type TemplateLockReason,
  type TemplateTier,
} from '../template-access.policy';

export class TemplateListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ type: String, nullable: true })
  category!: string | null;

  @ApiProperty({ type: String, nullable: true })
  previewUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty()
  sortOrder!: number;

  /** `basic`: every plan. `pro`: Pro (and higher) plans only. */
  @ApiProperty({ enum: TEMPLATE_TIERS })
  tier!: TemplateTier;
}

/** A gallery item as seen by the caller's tenant. */
export class TemplateGalleryItemDto extends TemplateListItemDto {
  /** Whether the caller's plan lets it pick this template. Derived on every read. */
  @ApiProperty()
  accessible!: boolean;

  @ApiProperty({ enum: [...TEMPLATE_LOCK_REASONS, null], nullable: true })
  lockedReason!: TemplateLockReason | null;
}
