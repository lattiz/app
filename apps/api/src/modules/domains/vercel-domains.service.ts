import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Registers purchased domains on the shared Vercel project (triggers SSL provisioning). */
@Injectable()
export class VercelDomainsService {
  private readonly logger = new Logger(VercelDomainsService.name);
  private readonly token: string;
  private readonly projectId: string;

  constructor(configService: ConfigService) {
    // Boots without credentials (mirrors StripeProvider); calls fail until configured.
    this.token = configService.get<string>('VERCEL_TOKEN') ?? '';
    this.projectId = configService.get<string>('VERCEL_PROJECT_ID') ?? '';
    if (!this.token || !this.projectId) {
      this.logger.warn(
        'VERCEL_TOKEN / VERCEL_PROJECT_ID not set — domain mapping will fail until configured.',
      );
    }
  }

  async addDomain(domain: string): Promise<{ name: string; verified: boolean }> {
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${this.projectId}/domains`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error(
        `Vercel domain add failed: ${res.status} ${JSON.stringify(err)}`,
      );
      throw new Error(`Vercel domain registration failed: ${res.status}`);
    }

    return (await res.json()) as { name: string; verified: boolean };
  }

  async hasDomain(domain: string): Promise<boolean> {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${this.projectId}/domains/${domain}`,
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Vercel domain lookup failed: ${res.status}`);
    return true;
  }

  async removeDomain(domain: string): Promise<void> {
    await fetch(
      `https://api.vercel.com/v10/projects/${this.projectId}/domains/${domain}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
  }
}
