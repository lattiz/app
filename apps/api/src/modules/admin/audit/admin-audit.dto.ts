import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function queryNumber({ value }: { value: unknown }): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

export class AdminAuditQueryDto {
  /** Email or user id of the actor. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  actor?: string;

  /** Action prefix, for example `template.`. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(100_000)
  page?: number;

  /** Values above 100 are clipped. */
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(10_000)
  pageSize?: number;
}

export class AdminAuditEntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  actorUserId!: string;

  @ApiProperty({ type: String, nullable: true })
  actorEmail!: string | null;

  @ApiProperty()
  action!: string;

  @ApiProperty({ type: String, nullable: true })
  targetType!: string | null;

  @ApiProperty({ type: String, nullable: true })
  targetId!: string | null;

  @ApiProperty({ type: String, nullable: true })
  reason!: string | null;

  @ApiProperty({ nullable: true })
  before!: unknown;

  @ApiProperty({ nullable: true })
  after!: unknown;

  @ApiProperty({ type: String, nullable: true })
  ip!: string | null;

  /** `user_agent` clipped to 200 characters. */
  @ApiProperty({ type: String, nullable: true })
  userAgent!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class AdminAuditListResponseDto {
  @ApiProperty({ type: [AdminAuditEntryDto] })
  items!: AdminAuditEntryDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}
