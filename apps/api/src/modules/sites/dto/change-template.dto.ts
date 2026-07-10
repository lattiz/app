import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeTemplateDto {
  /** Id of the template to switch the tenant's site to. */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  /** Must be true when the site already has content, to acknowledge the reset. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}
