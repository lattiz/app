import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

/** GA4 settings. Every value is optional so the API boots with no GA env vars at all. */
@Injectable()
export class AnalyticsConfig {
  readonly isMock: boolean;
  readonly accountId: string | null;
  readonly credentials: ServiceAccountCredentials | null;
  readonly timeZone: string;
  readonly currencyCode = 'MXN';
  readonly reportTtlSeconds: number;
  readonly realtimeTtlSeconds: number;

  constructor(config: ConfigService) {
    this.isMock = config.get<string>('GA4_MOCK') === 'true';
    this.accountId = config.get<string>('GA4_ACCOUNT_ID')?.trim() || null;
    this.credentials = decodeCredentials(
      config.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'),
    );
    this.timeZone =
      config.get<string>('GA4_TIMEZONE')?.trim() || 'America/Mexico_City';
    const ttl = parseInt(config.get<string>('GA4_REPORT_TTL_SECONDS') ?? '', 10);
    this.reportTtlSeconds = Number.isFinite(ttl) && ttl > 0 ? ttl : 3600;
    const realtimeTtl = parseInt(
      config.get<string>('GA4_REALTIME_TTL_SECONDS') ?? '',
      10,
    );
    this.realtimeTtlSeconds =
      Number.isFinite(realtimeTtl) && realtimeTtl > 0 ? realtimeTtl : 30;
  }

  get isConfigured(): boolean {
    return this.isMock || (this.accountId !== null && this.credentials !== null);
  }
}

function decodeCredentials(
  base64: string | undefined,
): ServiceAccountCredentials | null {
  if (!base64?.trim()) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(base64.trim(), 'base64').toString('utf8'),
    ) as Partial<ServiceAccountCredentials>;
    if (!parsed.client_email || !parsed.private_key) return null;
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  } catch {
    return null;
  }
}
