import { ApiProperty } from '@nestjs/swagger';
import {
  Allow,
  IsDefined,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AdminSettingViewDto {
  @ApiProperty()
  key!: string;

  /** Prefix before the first dot. */
  @ApiProperty()
  group!: string;

  @ApiProperty({
    enum: ['bool', 'int', 'string', 'string-list', 'int-list'],
  })
  type!: 'bool' | 'int' | 'string' | 'string-list' | 'int-list';

  @ApiProperty({ type: Number, nullable: true })
  min!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  max!: number | null;

  @ApiProperty({ nullable: true })
  default!: unknown;

  /** Raw env string when the variable is set. Omitted for secret-like names. */
  @ApiProperty({ type: String, nullable: true })
  envValue!: string | null;

  @ApiProperty({ nullable: true })
  dbValue!: unknown;

  @ApiProperty({ nullable: true })
  effectiveValue!: unknown;

  @ApiProperty({ enum: ['db', 'env', 'default'] })
  source!: 'db' | 'env' | 'default';

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ type: String, nullable: true })
  updatedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  updatedBy!: string | null;
}

export class AdminSettingsResponseDto {
  @ApiProperty({ type: [AdminSettingViewDto] })
  items!: AdminSettingViewDto[];
}

export class AdminUpdateSettingDto {
  /** JSON value. The registry parser checks the type and the range. */
  @ApiProperty()
  @Allow()
  @IsDefined()
  value!: unknown;

  @ApiProperty({ minLength: 3, maxLength: 300 })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason!: string;
}

export class AdminDeleteSettingDto {
  @ApiProperty({ minLength: 3, maxLength: 300 })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason!: string;
}
