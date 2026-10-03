import { Logger } from '@nestjs/common';
import type {
  DnsProviderPort,
  DnsRecord,
  DnsZone,
  DnsZoneInventoryPort,
  DnsZoneSummary,
} from '../../domain/dns-provider.port';
import { DnsProviderApiException } from '../../domains.exceptions';
import { CloudflareClient } from './cloudflare.client';

interface CloudflareZone {
  id: string;
  name: string;
  name_servers?: string[];
  created_on?: string;
}

interface CloudflareRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied?: boolean;
}

// Only these types can conflict with the web records Lattiz manages (A/AAAA cannot share a name with a CNAME).
const WEB_RECORD_TYPES = new Set(['A', 'AAAA', 'CNAME']);

// ttl 1 = automatic; DNS-only (grey cloud) because Vercel terminates TLS for these hosts.
const AUTOMATIC_TTL = 1;

const ZONES_PER_PAGE = 50;
const RECORDS_PER_PAGE = 100;

export class CloudflareDnsAdapter
  implements DnsProviderPort, DnsZoneInventoryPort
{
  readonly provider = 'cloudflare';
  private readonly logger = new Logger(CloudflareDnsAdapter.name);

  constructor(private readonly client: CloudflareClient) {}

  async listZones(): Promise<DnsZoneSummary[]> {
    const zones = await this.client.getAll<CloudflareZone>('zones', {
      operation: 'zone listing',
      query: { 'account.id': this.client.accountId },
      perPage: ZONES_PER_PAGE,
    });
    return zones.map((z) => {
      const createdAt = z.created_on ? new Date(z.created_on) : null;
      return {
        zoneId: z.id,
        name: z.name.toLowerCase(),
        createdAt:
          createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null,
      };
    });
  }

  async ensureZone(domain: string): Promise<DnsZone> {
    const name = normalize(domain);
    const zone = (await this.findZone(name)) ?? (await this.createZone(name));
    return toDnsZone(zone);
  }

  async upsertRecords(domain: string, records: DnsRecord[]): Promise<void> {
    const name = normalize(domain);
    // Never create the zone here: a lazily re-created zone would resurrect one we deleted on purpose.
    const zone = await this.findZone(name);
    if (!zone) {
      throw new DnsProviderApiException(
        'record sync',
        `zone for ${name} does not exist`,
      );
    }

    for (const desired of records) {
      const fqdn = desired.name === '@' ? name : `${desired.name}.${name}`;
      const existing = await this.listRecordsAt(zone.id, fqdn);
      await this.convergeName(zone.id, fqdn, desired, existing);
    }
  }

  async deleteZone(domain: string): Promise<void> {
    const zone = await this.findZone(normalize(domain));
    if (!zone) return;
    try {
      await this.client.delete(`zones/${zone.id}`, {
        operation: 'zone deletion',
      });
    } catch (err) {
      // Deleted by someone else between the lookup and the delete.
      if (err instanceof DnsProviderApiException && err.httpStatus === 404)
        return;
      throw err;
    }
  }

  async requestActivationCheck(domain: string): Promise<void> {
    const zone = await this.findZone(normalize(domain));
    if (!zone) {
      this.logger.warn(
        `No Cloudflare zone for ${domain}; skipping activation check`,
      );
      return;
    }
    await this.client.put(`zones/${zone.id}/activation_check`, {
      operation: 'activation check',
    });
  }

  private async findZone(name: string): Promise<CloudflareZone | null> {
    const zones = await this.client.getAll<CloudflareZone>('zones', {
      operation: 'zone lookup',
      query: { name, 'account.id': this.client.accountId },
      perPage: ZONES_PER_PAGE,
    });
    // `name` filters with the exact operator by default; compare anyway so a looser match never wins.
    return zones.find((z) => z.name.toLowerCase() === name) ?? null;
  }

  private async createZone(name: string): Promise<CloudflareZone> {
    try {
      return await this.client.post<CloudflareZone>('zones', {
        operation: 'zone creation',
        body: { name, account: { id: this.client.accountId }, type: 'full' },
      });
    } catch (err) {
      if (!(err instanceof DnsProviderApiException)) throw err;
      // A concurrent request may have created it first ("already exists"); only a re-find can tell.
      const raced = await this.findZone(name).catch(() => null);
      if (raced) return raced;
      throw err;
    }
  }

  private listRecordsAt(
    zoneId: string,
    fqdn: string,
  ): Promise<CloudflareRecord[]> {
    return this.client
      .getAll<CloudflareRecord>(`zones/${zoneId}/dns_records`, {
        operation: 'record lookup',
        query: { 'name.exact': fqdn },
        perPage: RECORDS_PER_PAGE,
      })
      .then((all) => all.filter((r) => r.name.toLowerCase() === fqdn));
  }

  /** Leaves exactly one record at `fqdn` among the web record types, reusing a same-type record in place when possible. */
  private async convergeName(
    zoneId: string,
    fqdn: string,
    desired: DnsRecord,
    existing: CloudflareRecord[],
  ): Promise<void> {
    const web = existing.filter((r) => WEB_RECORD_TYPES.has(r.type));
    const keeper =
      web.find((r) => isConverged(r, desired)) ??
      web.find((r) => r.type === desired.type);
    const body = {
      type: desired.type,
      name: fqdn,
      content: desired.value,
      ttl: AUTOMATIC_TTL,
      proxied: false,
    };

    // Deletes first: a CNAME cannot be created next to a leftover A (and vice versa).
    for (const stale of web.filter((r) => r !== keeper)) {
      await this.deleteRecord(zoneId, stale.id);
    }
    if (!keeper) {
      await this.client.post(`zones/${zoneId}/dns_records`, {
        operation: 'record creation',
        body,
      });
    } else if (!isConverged(keeper, desired)) {
      await this.client.put(`zones/${zoneId}/dns_records/${keeper.id}`, {
        operation: 'record update',
        body,
      });
    }
  }

  private async deleteRecord(zoneId: string, recordId: string): Promise<void> {
    try {
      await this.client.delete(`zones/${zoneId}/dns_records/${recordId}`, {
        operation: 'record deletion',
      });
    } catch (err) {
      if (err instanceof DnsProviderApiException && err.httpStatus === 404)
        return;
      throw err;
    }
  }
}

function normalize(domain: string): string {
  return domain.toLowerCase().replace(/\.$/, '');
}

function toDnsZone(zone: CloudflareZone): DnsZone {
  const nameservers = zone.name_servers ?? [];
  if (nameservers.length === 0) {
    throw new DnsProviderApiException(
      'zone lookup',
      `zone ${zone.name} has no name servers`,
    );
  }
  return { zoneId: zone.id, nameservers };
}

function isConverged(record: CloudflareRecord, desired: DnsRecord): boolean {
  return (
    record.type === desired.type &&
    normalizeContent(record.content) === normalizeContent(desired.value) &&
    record.proxied !== true &&
    record.ttl === AUTOMATIC_TTL
  );
}

function normalizeContent(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}
