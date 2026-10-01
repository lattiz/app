import { Logger } from '@nestjs/common';
import { v1beta as adminV1beta } from '@google-analytics/admin';
import { v1beta as dataV1beta, protos } from '@google-analytics/data';
import { createHash, randomInt } from 'node:crypto';
import { AnalyticsConfig } from './analytics.config';

type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

export interface PeriodTotals {
  sessions: number;
  activeUsers: number;
}

/** Report data as GA returns it, before gap-filling and localization. */
export interface RawOverview {
  current: PeriodTotals;
  previous: PeriodTotals;
  /** `date` is GA's `YYYYMMDD`; days with no sessions may be absent. */
  daily: { date: string; sessions: number }[];
  /** Sorted by sessions desc, as GA returns them. */
  channels: { name: string; sessions: number }[];
}

export interface Ga4Gateway {
  readonly isMock: boolean;
  createProperty(a: {
    displayName: string;
    timeZone: string;
    currencyCode: string;
  }): Promise<{ propertyId: string }>;
  createWebStream(a: {
    propertyId: string;
    displayName: string;
    defaultUri?: string;
  }): Promise<{ streamId: string; measurementId: string }>;
  /** Event data retention → 14 months. Best-effort; callers must not fail on it. */
  setRetention(propertyId: string): Promise<void>;
  runOverviewReport(propertyId: string): Promise<RawOverview>;
}

export const GA4_GATEWAY = Symbol('GA4_GATEWAY');

const CURRENT_RANGE = { startDate: '27daysAgo', endDate: 'today' };
const PREVIOUS_RANGE = { startDate: '55daysAgo', endDate: '28daysAgo' };

/** Google Analytics Admin API (v1beta) + Data API (v1beta) with Lattiz's service account. */
export class RealGa4Gateway implements Ga4Gateway {
  readonly isMock = false;
  private readonly logger = new Logger(RealGa4Gateway.name);
  private admin: adminV1beta.AnalyticsAdminServiceClient | null = null;
  private data: dataV1beta.BetaAnalyticsDataClient | null = null;
  private loggedRawShape = false;

  constructor(private readonly config: AnalyticsConfig) {}

  async createProperty(a: {
    displayName: string;
    timeZone: string;
    currencyCode: string;
  }): Promise<{ propertyId: string }> {
    const [property] = await this.adminClient().createProperty({
      property: {
        parent: `accounts/${this.config.accountId}`,
        displayName: a.displayName,
        timeZone: a.timeZone,
        currencyCode: a.currencyCode,
      },
    });
    const propertyId = lastSegment(property.name);
    if (!propertyId) throw new Error('createProperty returned no property name');
    return { propertyId };
  }

  async createWebStream(a: {
    propertyId: string;
    displayName: string;
    defaultUri?: string;
  }): Promise<{ streamId: string; measurementId: string }> {
    const [stream] = await this.adminClient().createDataStream({
      parent: `properties/${a.propertyId}`,
      dataStream: {
        type: 'WEB_DATA_STREAM',
        displayName: a.displayName,
        // Optional in the API: provisioning must not depend on the tenant having a domain.
        ...(a.defaultUri ? { webStreamData: { defaultUri: a.defaultUri } } : {}),
      },
    });
    const streamId = lastSegment(stream.name);
    const measurementId = stream.webStreamData?.measurementId;
    if (!streamId || !measurementId) {
      throw new Error('createDataStream returned no stream name or measurement id');
    }
    return { streamId, measurementId };
  }

  async setRetention(propertyId: string): Promise<void> {
    await this.adminClient().updateDataRetentionSettings({
      dataRetentionSettings: {
        name: `properties/${propertyId}/dataRetentionSettings`,
        eventDataRetention: 'FOURTEEN_MONTHS',
      },
      updateMask: { paths: ['event_data_retention'] },
    });
  }

  async runOverviewReport(propertyId: string): Promise<RawOverview> {
    const [response] = await this.dataClient().batchRunReports({
      property: `properties/${propertyId}`,
      requests: [
        {
          dateRanges: [CURRENT_RANGE, PREVIOUS_RANGE],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        },
        {
          dateRanges: [CURRENT_RANGE],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        },
        {
          dateRanges: [CURRENT_RANGE],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 6,
        },
      ],
    });

    const [totals, daily, channels] = response.reports ?? [];
    if (!this.loggedRawShape) {
      this.loggedRawShape = true;
      this.logger.debug(
        `[analytics] Raw totals report shape: ${JSON.stringify({
          dimensionHeaders: totals?.dimensionHeaders,
          metricHeaders: totals?.metricHeaders,
          rows: totals?.rows,
        })}`,
      );
    }

    return {
      ...parseTotals(totals),
      daily: parseDimensionRows(daily, 'date').map(([date, sessions]) => ({
        date,
        sessions,
      })),
      channels: parseDimensionRows(channels, 'sessionDefaultChannelGroup').map(
        ([name, sessions]) => ({ name, sessions }),
      ),
    };
  }

  private adminClient(): adminV1beta.AnalyticsAdminServiceClient {
    this.admin ??= new adminV1beta.AnalyticsAdminServiceClient({
      credentials: this.requireCredentials(),
    });
    return this.admin;
  }

  private dataClient(): dataV1beta.BetaAnalyticsDataClient {
    this.data ??= new dataV1beta.BetaAnalyticsDataClient({
      credentials: this.requireCredentials(),
    });
    return this.data;
  }

  private requireCredentials(): { client_email: string; private_key: string } {
    if (!this.config.credentials) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not configured');
    }
    return this.config.credentials;
  }
}

/**
 * With two date ranges GA adds an implicit `dateRange` dimension
 * (`date_range_0` / `date_range_1`); a range with no data has no row at all.
 */
function parseTotals(report: RunReportResponse | undefined): {
  current: PeriodTotals;
  previous: PeriodTotals;
} {
  const result = {
    current: { sessions: 0, activeUsers: 0 },
    previous: { sessions: 0, activeUsers: 0 },
  };
  if (!report?.rows?.length) return result;

  const metricNames = (report.metricHeaders ?? []).map((h) => h.name ?? '');
  const sessionsIdx = metricNames.indexOf('sessions');
  const usersIdx = metricNames.indexOf('activeUsers');
  const rangeIdx = Math.max(
    0,
    (report.dimensionHeaders ?? []).findIndex((h) => h.name === 'dateRange'),
  );

  for (const row of report.rows) {
    const range = row.dimensionValues?.[rangeIdx]?.value;
    const target =
      range === 'date_range_1'
        ? result.previous
        : range === 'date_range_0' || report.rows.length === 1
          ? result.current
          : null;
    if (!target) continue;
    target.sessions = toNumber(row.metricValues?.[sessionsIdx]?.value);
    target.activeUsers = toNumber(row.metricValues?.[usersIdx]?.value);
  }
  return result;
}

function parseDimensionRows(
  report: RunReportResponse | undefined,
  dimension: string,
): [string, number][] {
  if (!report?.rows?.length) return [];
  const dimIdx = Math.max(
    0,
    (report.dimensionHeaders ?? []).findIndex((h) => h.name === dimension),
  );
  const metricIdx = Math.max(
    0,
    (report.metricHeaders ?? []).findIndex((h) => h.name === 'sessions'),
  );
  return report.rows
    .map((row): [string, number] => [
      row.dimensionValues?.[dimIdx]?.value ?? '',
      toNumber(row.metricValues?.[metricIdx]?.value),
    ])
    .filter(([key]) => key !== '');
}

function toNumber(value: string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function lastSegment(name: string | null | undefined): string | null {
  const segment = name?.split('/').pop();
  return segment ? segment : null;
}

const MOCK_CHANNELS: [string, number][] = [
  ['Organic Search', 0.46],
  ['Direct', 0.27],
  ['Organic Social', 0.14],
  ['Referral', 0.08],
  ['Unassigned', 0.05],
];

/** Instant, credential-free stand-in. Report data is deterministic per property. */
export class MockGa4Gateway implements Ga4Gateway {
  readonly isMock = true;

  constructor(private readonly config: AnalyticsConfig) {}

  createProperty(): Promise<{ propertyId: string }> {
    return Promise.resolve({ propertyId: `mock-${uniqueDigits()}` });
  }

  createWebStream(): Promise<{ streamId: string; measurementId: string }> {
    const digits = uniqueDigits();
    return Promise.resolve({
      streamId: `mock-${digits}`,
      measurementId: `G-MOCK${digits.slice(-12)}`,
    });
  }

  setRetention(): Promise<void> {
    return Promise.resolve();
  }

  runOverviewReport(propertyId: string): Promise<RawOverview> {
    const rand = seededRandom(propertyId);
    const base = 18 + Math.floor(rand() * 40);
    const today = todayInZone(this.config.timeZone);

    const daily: RawOverview['daily'] = [];
    for (let offset = 27; offset >= 0; offset--) {
      const day = addDays(today, -offset);
      const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
      const weekendFactor = weekday === 0 || weekday === 6 ? 0.55 : 1;
      const sessions = Math.round(base * weekendFactor * (0.7 + rand() * 0.6));
      // Drop a couple of zero-ish days so gap-filling is exercised.
      if (offset % 11 === 5) continue;
      daily.push({ date: day.replaceAll('-', ''), sessions });
    }

    const sessions = daily.reduce((sum, d) => sum + d.sessions, 0);
    const previousSessions = Math.round(sessions * (0.75 + rand() * 0.4));
    let assigned = 0;
    const channels = MOCK_CHANNELS.map(([name, share], i) => {
      const value =
        i === MOCK_CHANNELS.length - 1
          ? sessions - assigned
          : Math.round(sessions * share);
      assigned += value;
      return { name, sessions: Math.max(0, value) };
    });

    return Promise.resolve({
      current: { sessions, activeUsers: Math.round(sessions * 0.72) },
      previous: {
        sessions: previousSessions,
        activeUsers: Math.round(previousSessions * 0.7),
      },
      daily,
      channels,
    });
  }
}

/** Today's calendar date (`YYYY-MM-DD`) in an IANA zone. */
export function todayInZone(timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Calendar arithmetic on a `YYYY-MM-DD` string, independent of the host zone. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function uniqueDigits(): string {
  return `${Date.now()}${randomInt(100, 999)}`;
}

function seededRandom(seed: string): () => number {
  let state = createHash('sha256').update(seed).digest().readUInt32LE(0);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGa4Gateway(config: AnalyticsConfig): Ga4Gateway {
  return config.isMock ? new MockGa4Gateway(config) : new RealGa4Gateway(config);
}
