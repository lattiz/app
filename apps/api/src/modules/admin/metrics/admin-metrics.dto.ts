import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const METRIC_PLANS = ['basico', 'pro'] as const;
export const METRIC_PERIODS = ['monthly', 'annual', 'weekly'] as const;
export const TEMPLATE_TIERS = ['basic', 'pro'] as const;
export const REVENUE_ERRORS = ['unavailable'] as const;

function queryNumber({ value }: { value: unknown }): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

export class MetricsRevenueQueryDto {
  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 24 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number;
}

export class MetricsFunnelQueryDto {
  @ApiPropertyOptional({ default: 30, minimum: 7, maximum: 365 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(7)
  @Max(365)
  days?: number;
}

export class MetricsHistoryQueryDto {
  @ApiPropertyOptional({ default: 90, minimum: 7, maximum: 730 })
  @IsOptional()
  @Transform(queryNumber)
  @IsInt()
  @Min(7)
  @Max(730)
  days?: number;
}

export class MetricsMrrPlanDto {
  @ApiProperty({ enum: METRIC_PLANS })
  plan!: (typeof METRIC_PLANS)[number];

  @ApiProperty()
  mrrCents!: number;
}

export class MetricsMrrPeriodDto {
  @ApiProperty({ enum: METRIC_PERIODS })
  period!: (typeof METRIC_PERIODS)[number];

  @ApiProperty()
  mrrCents!: number;
}

export class MetricsMrrCurrencyDto {
  @ApiProperty()
  currency!: string;

  @ApiProperty()
  mrrCents!: number;

  @ApiProperty()
  arrCents!: number;

  @ApiProperty({ type: [MetricsMrrPlanDto] })
  byPlan!: MetricsMrrPlanDto[];

  @ApiProperty({ type: [MetricsMrrPeriodDto] })
  byPeriod!: MetricsMrrPeriodDto[];
}

export class MetricsCustomersDto {
  @ApiProperty()
  payingTenants!: number;

  @ApiProperty()
  newPayingThisMonth!: number;

  @ApiProperty()
  cancellationsThisMonth!: number;

  /** Cancelaciones del mes ÷ pagadores al inicio. Null si no había pagadores. */
  @ApiProperty({ type: Number, nullable: true })
  churnRateThisMonth!: number | null;

  /** past_due más cancelaciones programadas, un cliente cuenta una vez. */
  @ApiProperty()
  atRisk!: number;
}

export class MetricsTrialsDto {
  @ApiProperty()
  active!: number;

  @ApiProperty()
  expiringWithin48h!: number;
}

export class MetricsRenewalsNext30DaysDto {
  @ApiProperty()
  count!: number;

  @ApiProperty()
  expectedRevenueCents!: number;

  @ApiProperty()
  currency!: string;
}

export class MetricsProductDto {
  @ApiProperty()
  publishedSites!: number;

  @ApiProperty()
  domainsPurchased!: number;

  @ApiProperty()
  domainsConnected!: number;

  @ApiProperty()
  renewalsOverdue!: number;

  @ApiProperty({ type: MetricsRenewalsNext30DaysDto })
  renewalsNext30Days!: MetricsRenewalsNext30DaysDto;
}

export class MetricsOverviewDto {
  @ApiProperty({ type: Number, nullable: true })
  mrrCents!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  arrCents!: number | null;

  @ApiProperty({ type: String, nullable: true })
  currency!: string | null;

  @ApiProperty({ type: [MetricsMrrPlanDto] })
  mrrByPlan!: MetricsMrrPlanDto[];

  @ApiProperty({ type: [MetricsMrrPeriodDto] })
  mrrByPeriod!: MetricsMrrPeriodDto[];

  @ApiProperty({ type: [MetricsMrrCurrencyDto] })
  mrrByCurrency!: MetricsMrrCurrencyDto[];

  @ApiProperty({ enum: REVENUE_ERRORS, nullable: true })
  revenueError!: (typeof REVENUE_ERRORS)[number] | null;

  @ApiProperty({ type: MetricsCustomersDto })
  customers!: MetricsCustomersDto;

  @ApiProperty({ type: MetricsTrialsDto })
  trials!: MetricsTrialsDto;

  @ApiProperty({ type: MetricsProductDto })
  product!: MetricsProductDto;

  @ApiProperty()
  generatedAt!: string;
}

export class MetricsRevenueMonthDto {
  @ApiProperty()
  month!: string;

  @ApiProperty()
  grossCents!: number;

  @ApiProperty()
  feeCents!: number;

  @ApiProperty()
  refundCents!: number;

  @ApiProperty()
  netCents!: number;

  @ApiProperty()
  currency!: string;
}

export class MetricsRevenueDto {
  @ApiProperty({ type: [MetricsRevenueMonthDto] })
  items!: MetricsRevenueMonthDto[];

  @ApiProperty()
  months!: number;
}

export class MetricsFunnelDto {
  @ApiProperty()
  days!: number;

  @ApiProperty()
  signups!: number;

  @ApiProperty()
  choseTemplate!: number;

  @ApiProperty()
  published!: number;

  @ApiProperty()
  paid!: number;

  @ApiProperty({ type: Number, nullable: true })
  choseTemplateRate!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  publishedRate!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  paidRate!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  medianHoursToPay!: number | null;
}

export class MetricsTemplateRankDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: TEMPLATE_TIERS })
  tier!: (typeof TEMPLATE_TIERS)[number];

  @ApiProperty()
  tenantsUsing!: number;

  @ApiProperty()
  payingTenants!: number;

  @ApiProperty({ type: Number, nullable: true })
  conversionRate!: number | null;
}

export class MetricsTemplatesDto {
  @ApiProperty({ type: [MetricsTemplateRankDto] })
  byAdoption!: MetricsTemplateRankDto[];

  @ApiProperty({ type: [MetricsTemplateRankDto] })
  byConversion!: MetricsTemplateRankDto[];
}

export class MetricsHistoryItemDto {
  @ApiProperty()
  day!: string;

  @ApiProperty({ type: Number, nullable: true })
  mrrCents!: number | null;

  @ApiProperty({ type: String, nullable: true })
  currency!: string | null;

  @ApiProperty()
  payingTenants!: number;

  @ApiProperty()
  trialsActive!: number;

  @ApiProperty()
  signups!: number;

  @ApiProperty()
  newPaying!: number;

  @ApiProperty()
  cancellations!: number;

  @ApiProperty()
  publishedSites!: number;

  @ApiProperty()
  capturedAt!: string;
}

export class MetricsHistoryDto {
  @ApiProperty({ type: [MetricsHistoryItemDto] })
  items!: MetricsHistoryItemDto[];

  @ApiProperty()
  days!: number;
}
