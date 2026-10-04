import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateSlugDto {
  /** Desired address; normalized and validated server-side so every failure carries a stable code. */
  @ApiProperty({ example: 'panaderia-lopez' })
  @IsString()
  slug!: string;
}

export class SlugAvailabilityQueryDto {
  /** Address to check; trimmed and lowercased server-side. */
  @ApiProperty({ example: 'panaderia-lopez' })
  @IsString()
  slug!: string;
}
