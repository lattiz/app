import { ApiProperty } from '@nestjs/swagger';

export const ANALYTICS_STATUSES = [
  'not_eligible',
  'unavailable',
  'provisioning',
  'failed',
  'ready',
] as const;
export type AnalyticsStatus = (typeof ANALYTICS_STATUSES)[number];

export class AnalyticsDailyPointDto {
  /** Calendar day in the GA property time zone, `YYYY-MM-DD`. */
  @ApiProperty()
  date!: string;

  @ApiProperty()
  sessions!: number;
}

export class AnalyticsChannelDto {
  /** GA `sessionDefaultChannelGroup` value, untranslated. */
  @ApiProperty()
  key!: string;

  /** Spanish display label. */
  @ApiProperty()
  label!: string;

  @ApiProperty()
  sessions!: number;

  /** Share of all sessions in the window, 0–100. */
  @ApiProperty()
  sharePct!: number;
}

export class AnalyticsReportDto {
  @ApiProperty()
  rangeDays!: number;

  @ApiProperty()
  sessions!: number;

  /** Null when the previous period had zero sessions. */
  @ApiProperty({ type: Number, nullable: true })
  sessionsDeltaPct!: number | null;

  @ApiProperty()
  activeUsers!: number;

  @ApiProperty({ type: Number, nullable: true })
  activeUsersDeltaPct!: number | null;

  /** Exactly `rangeDays` points, oldest first, gap-filled with zeros. */
  @ApiProperty({ type: [AnalyticsDailyPointDto] })
  daily!: AnalyticsDailyPointDto[];

  /** Top channels by sessions (at most 5). */
  @ApiProperty({ type: [AnalyticsChannelDto] })
  channels!: AnalyticsChannelDto[];

  @ApiProperty({ type: AnalyticsChannelDto, nullable: true })
  topChannel!: AnalyticsChannelDto | null;

  @ApiProperty()
  hasData!: boolean;
}

export class AnalyticsOverviewDto {
  @ApiProperty({ enum: ANALYTICS_STATUSES, enumName: 'AnalyticsStatus' })
  status!: AnalyticsStatus;

  @ApiProperty({ type: AnalyticsReportDto, nullable: true })
  report!: AnalyticsReportDto | null;

  @ApiProperty({ type: String, nullable: true })
  fetchedAt!: string | null;

  /** True when the Data API failed and an expired cached report is served instead. */
  @ApiProperty()
  stale!: boolean;

  /** When `POST /analytics/retry` will be accepted again (only for `failed`). */
  @ApiProperty({ type: String, nullable: true })
  retryAvailableAt!: string | null;
}

export class AnalyticsRealtimeMinuteDto {
  /** 29 (oldest) … 0 (the current minute). */
  @ApiProperty()
  minutesAgo!: number;

  @ApiProperty()
  activeUsers!: number;
}

export class AnalyticsRealtimeDataDto {
  /** Distinct users in the last 30 minutes (not the sum of `perMinute`). */
  @ApiProperty()
  activeUsers!: number;

  /** Exactly 30 points oldest → newest, or empty when the per-minute breakdown failed. */
  @ApiProperty({ type: [AnalyticsRealtimeMinuteDto] })
  perMinute!: AnalyticsRealtimeMinuteDto[];
}

export class AnalyticsRealtimeDto {
  @ApiProperty({ enum: ANALYTICS_STATUSES, enumName: 'AnalyticsStatus' })
  status!: AnalyticsStatus;

  @ApiProperty({ type: AnalyticsRealtimeDataDto, nullable: true })
  realtime!: AnalyticsRealtimeDataDto | null;

  /** True when the Realtime API failed; the failure is cached for a minute. */
  @ApiProperty()
  unavailable!: boolean;

  @ApiProperty({ type: String, nullable: true })
  fetchedAt!: string | null;
}
