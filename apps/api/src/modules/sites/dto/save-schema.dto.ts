import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class SaveSchemaDto {
  /** The full GrapesJS project JSON (editor state) to persist. */
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  project!: Record<string, unknown>;
}
