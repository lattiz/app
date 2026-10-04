import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Last resort when the config endpoint returns no recommendation.
const FALLBACK_IPV4 = '76.76.21.21';
const FALLBACK_CNAME = 'cname.vercel-dns.com';
const CONFIG_TIMEOUT_MS = 10_000;

interface VercelDomainConfig {
  recommendedIPv4?: Array<{ rank: number; value: string[] }>;
  recommendedCNAME?: Array<{ rank: number; value: string }>;
  misconfigured?: boolean;
}

/** Registers purchased domains on the shared Vercel project (triggers SSL provisioning). */
@Injectable()
export class VercelDomainsService {
  private readonly logger = new Logger(VercelDomainsService.name);
  private readonly token: string;
  private readonly projectId: string;
  // Optional: set when the project lives in a Vercel team rather than a personal account.
  private readonly teamId: string;

  constructor(configService: ConfigService) {
    // Boots without credentials (mirrors StripeProvider); calls fail until configured.
    this.token = configService.get<string>('VERCEL_TOKEN') ?? '';
    this.projectId = configService.get<string>('VERCEL_PROJECT_ID') ?? '';
    this.teamId = configService.get<string>('VERCEL_TEAM_ID')?.trim() ?? '';
    if (!this.token || !this.projectId) {
      this.logger.warn(
        'VERCEL_TOKEN / VERCEL_PROJECT_ID not set — domain mapping will fail until configured.',
      );
    }
  }

  async addDomain(
    domain: string,
  ): Promise<{ name: string; verified: boolean }> {
    const res = await fetch(
      this.url(`/v10/projects/${this.projectId}/domains`),
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
      this.url(
        `/v9/projects/${this.projectId}/domains/${encodeURIComponent(domain)}`,
      ),
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Vercel domain lookup failed: ${res.status}`);
    return true;
  }

  async removeDomain(domain: string): Promise<void> {
    // DELETE is documented only on v9 (the add is v10).
    const res = await fetch(
      this.url(
        `/v9/projects/${this.projectId}/domains/${encodeURIComponent(domain)}`,
      ),
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    if (!res.ok && res.status !== 404) {
      this.logger.warn(
        `Vercel domain removal for ${domain} returned ${res.status}`,
      );
    }
  }

  /** Where the domain's apex (A) and www (CNAME) should point, per Vercel's own recommendation. */
  async getDnsTargets(
    domain: string,
  ): Promise<{ ipv4: string; cname: string }> {
    try {
      const config = await this.getConfig(domain);
      return {
        ipv4: preferred(config.recommendedIPv4)?.value[0] ?? FALLBACK_IPV4,
        // Vercel returns the CNAME with a trailing dot (FQDN form).
        cname:
          preferred(config.recommendedCNAME)?.value.replace(/\.$/, '') ||
          FALLBACK_CNAME,
      };
    } catch (err) {
      this.logger.warn(
        `Vercel DNS recommendation unavailable for ${domain}, using defaults: ${String(err)}`,
      );
      return { ipv4: FALLBACK_IPV4, cname: FALLBACK_CNAME };
    }
  }

  /** True once DNS points at Vercel and a TLS certificate can be issued. Throws on API failure. */
  async isDomainConfigured(domain: string): Promise<boolean> {
    return (await this.getConfig(domain)).misconfigured === false;
  }

  /** Every Vercel call goes through here so `teamId` is never forgotten. */
  private url(path: string, params: Record<string, string> = {}): string {
    const query = new URLSearchParams(params);
    if (this.teamId) query.set('teamId', this.teamId);
    const qs = query.toString();
    return `https://api.vercel.com${path}${qs ? `?${qs}` : ''}`;
  }

  private async getConfig(domain: string): Promise<VercelDomainConfig> {
    const res = await fetch(
      this.url(`/v6/domains/${encodeURIComponent(domain)}/config`, {
        projectIdOrName: this.projectId,
      }),
      {
        headers: { Authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(CONFIG_TIMEOUT_MS),
      },
    );
    if (!res.ok) throw new Error(`Vercel domain config failed: ${res.status}`);
    return (await res.json()) as VercelDomainConfig;
  }
}

/** rank=1 is the preferred recommendation. */
function preferred<T extends { rank: number }>(
  items: T[] | undefined,
): T | undefined {
  return items ? [...items].sort((a, b) => a.rank - b.rank)[0] : undefined;
}
