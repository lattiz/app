import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  ADMIN_TRIAL_STATES,
  type AdminTrialState,
} from './admin-trials.classify';

export { ADMIN_TRIAL_STATES, type AdminTrialState };

function queryNumber({ value }: { value: unknown }): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

export class AdminTrialListQueryDto {
  @ApiPropertyOptional({ enum: ADMIN_TRIAL_STATES })
  @IsOptional()
  @IsIn(ADMIN_TRIAL_STATES)
  state?: AdminTrialState;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(100_000)
  page?: number;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class AdminTrialTenantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  email!: string | null;
}

export class AdminTrialTemplateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;
}

export class AdminTrialListItemDto {
  @ApiProperty({ type: AdminTrialTenantDto })
  tenant!: AdminTrialTenantDto;

  @ApiProperty({ type: AdminTrialTemplateDto, nullable: true })
  template!: AdminTrialTemplateDto | null;

  @ApiProperty()
  previewStartedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  previewExpiresAt!: string | null;

  @ApiProperty({ enum: ADMIN_TRIAL_STATES })
  state!: AdminTrialState;

  @ApiProperty({ type: String, nullable: true })
  convertedAt!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  hoursToConvert!: number | null;
}

export class AdminTrialListResponseDto {
  @ApiProperty({ type: [AdminTrialListItemDto] })
  items!: AdminTrialListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class AdminTrialSummaryDto {
  @ApiProperty()
  active!: number;

  @ApiProperty()
  expiring!: number;

  @ApiProperty()
  expired!: number;

  @ApiProperty()
  converted!: number;

  /** Converted / started in the last 30 days. Null when none started. */
  @ApiProperty({ type: Number, nullable: true })
  conversionRate30d!: number | null;

  /** Converted / started in the last 90 days. Null when none started. */
  @ApiProperty({ type: Number, nullable: true })
  conversionRate90d!: number | null;

  /** Median hours from preview start to the first later subscription. */
  @ApiProperty({ type: Number, nullable: true })
  medianHoursToConvert!: number | null;

  @ApiProperty()
  trialDays!: number;

  @ApiProperty()
  enabled!: boolean;
}
