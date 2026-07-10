import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectTemplateDto {
  /** Id of the template to seed the tenant's site from. */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId!: string;
}
