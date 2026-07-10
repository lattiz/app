import { ApiProperty } from '@nestjs/swagger';

export class SiteSchemaResponseDto {
  /** The GrapesJS project JSON to load into the editor (`storage.project`). */
  @ApiProperty({ type: 'object', additionalProperties: true })
  project!: Record<string, unknown>;
}

export class SaveSchemaResponseDto {
  @ApiProperty()
  saved!: boolean;

  @ApiProperty({ description: 'ISO timestamp of the persisted change.' })
  updatedAt!: string;
}

export class PublishSiteResponseDto {
  @ApiProperty()
  published!: boolean;

  @ApiProperty({ description: 'ISO timestamp the site was published.' })
  publishedAt!: string;
}

export class SelectTemplateResponseDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  templateId!: string;

  @ApiProperty({ description: 'ISO timestamp the site schema was created.' })
  createdAt!: string;
}

export class ChangeTemplateResponseDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  templateId!: string;

  @ApiProperty({ description: 'ISO timestamp of the persisted change.' })
  updatedAt!: string;
}
