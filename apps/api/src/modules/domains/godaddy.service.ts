import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { GodaddyApiException } from './domains.exceptions';

export interface GodaddyAvailability {
  domain: string;
  available: boolean;
  prices?: Array<{
    term: string;
    period: number;
    price: { currencyCode: string; value: number };
  }>;
}

export interface GodaddyQuote {
  quoteToken: string;
  expiresAt: string;
  domain: string;
  available: boolean;
  price: { currencyCode: string; value: number };
  renewalPrice: { currencyCode: string; value: number };
  period: number;
  requiredAgreements: Array<{
    agreementType: string;
    title: string;
    url?: string;
  }>;
  irreversible: boolean;
}

export interface GodaddyRegistration {
  registrationId: string;
  domain: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  orderId?: string;
}

/**
 * GoDaddy API client covering v3 (quote-execute registrations, DNS) and v1
 * (auto-renew, legacy ops). The same PAT authenticates both versions.
 * Mock mode bypasses the registration call only — search and quote are always real.
 */
@Injectable()
export class GodaddyService {
  private readonly logger = new Logger(GodaddyService.name);
  private readonly baseUrl: string;
  private readonly pat: string;
  private readonly mockPurchases: boolean;

  constructor(configService: ConfigService) {
    // Boots without credentials (mirrors StripeProvider); calls fail until configured.
    this.baseUrl = (
      configService.get<string>('GODADDY_BASE_URL') ?? 'https://api.godaddy.com'
    ).replace(/\/$/, '');
    this.pat = configService.get<string>('GODADDY_PAT') ?? '';
    this.mockPurchases =
      configService.get<string>('GODADDY_MOCK_PURCHASES') === 'true';
    if (!this.pat) {
      this.logger.warn(
        'GODADDY_PAT is not set — domain calls will fail until configured.',
      );
    }
  }

  get isMockMode(): boolean {
    return this.mockPurchases;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.pat}`,
      'Content-Type': 'application/json',
    };
  }

  async checkAvailability(domain: string): Promise<GodaddyAvailability> {
    const url = `${this.baseUrl}/v3/domains/check-availability?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) {
      throw new GodaddyApiException('availability check', res.status);
    }
    return (await res.json()) as GodaddyAvailability;
  }

  /** Free, no side effects, safe to call speculatively. quoteToken TTL is 10 minutes, single-use. */
  async getRegistrationQuote(domain: string, period = 1): Promise<GodaddyQuote> {
    const res = await fetch(`${this.baseUrl}/v3/domains/registration-quotes`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ domain, period }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new GodaddyApiException('quote', res.status, JSON.stringify(err));
    }
    return (await res.json()) as GodaddyQuote;
  }

  /**
   * Charges real money unless GODADDY_MOCK_PURCHASES=true.
   * The idempotencyKey MUST already be persisted before calling this method.
   */
  async registerDomain(params: {
    domain: string;
    quoteToken: string;
    period: number;
    agreementTypes: string[];
    agreedAt: string;
    idempotencyKey: string;
  }): Promise<GodaddyRegistration> {
    if (this.mockPurchases) {
      this.logger.warn(`[MOCK] Simulating domain registration: ${params.domain}`);
      return {
        registrationId: `mock_${randomUUID()}`,
        domain: params.domain,
        status: 'COMPLETED',
        orderId: `mock_order_${Date.now()}`,
      };
    }

    const res = await fetch(`${this.baseUrl}/v3/domains/registrations`, {
      method: 'POST',
      headers: { ...this.headers(), 'Idempotency-Key': params.idempotencyKey },
      body: JSON.stringify({
        quoteToken: params.quoteToken,
        domain: params.domain,
        period: params.period,
        consent: {
          agreedAt: params.agreedAt,
          agreementTypes: params.agreementTypes,
        },
      }),
    });

    if (res.status !== 201 && res.status !== 202) {
      const err = await res.json().catch(() => ({}));
      throw new GodaddyApiException(
        'registration',
        res.status,
        JSON.stringify(err),
      );
    }
    return (await res.json()) as GodaddyRegistration;
  }

  async pollRegistration(
    registrationId: string,
  ): Promise<{ status: 'COMPLETED' | 'FAILED' | 'PENDING'; domain: string }> {
    if (registrationId.startsWith('mock_')) {
      return { status: 'COMPLETED', domain: '' };
    }
    const res = await fetch(
      `${this.baseUrl}/v3/domains/registrations/${registrationId}`,
      { headers: this.headers() },
    );
    if (!res.ok) {
      throw new GodaddyApiException('registration poll', res.status);
    }
    return (await res.json()) as {
      status: 'COMPLETED' | 'FAILED' | 'PENDING';
      domain: string;
    };
  }

  async createDnsRecord(
    domain: string,
    record: { type: 'CNAME' | 'A'; name: string; data: string; ttl: number },
  ): Promise<unknown> {
    const res = await fetch(
      `${this.baseUrl}/v3/domains/zones/${domain}/dns-records`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(record),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error(
        `GoDaddy DNS record creation failed: ${res.status} ${JSON.stringify(err)}`,
      );
      throw new GodaddyApiException('DNS record creation', res.status);
    }
    return res.json();
  }

  /** v1 endpoint. Non-fatal on failure — Lattiz controls renewal via cron, not GoDaddy billing. */
  async disableAutoRenew(domain: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/v1/domains/${domain}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ autoRenew: false }),
    });
    if (!res.ok) {
      this.logger.warn(`Failed to disable auto-renew for ${domain}: ${res.status}`);
    }
  }
}
