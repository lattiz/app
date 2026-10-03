import type {
  DnsProviderPort,
  DnsRecord,
  DnsZone,
} from '../../domain/dns-provider.port';
import { RegistrarApiException } from '../../domains.exceptions';
import { OpenproviderClient } from './openprovider.client';
import { splitDomain } from './openprovider.mappers';

interface ZoneRecord {
  name?: string;
  type: string;
  value: string;
  ttl?: number;
  prio?: number;
}

interface Zone {
  id: number;
  records?: ZoneRecord[];
}

// Only these types can conflict with the web records Lattiz manages.
const WEB_RECORD_TYPES = new Set(['A', 'AAAA', 'CNAME']);

// Openprovider's default DNS cluster (the `dns-openprovider` ns group the registrar adapter used to send).
export const OPENPROVIDER_NAMESERVERS = [
  'ns1.openprovider.nl',
  'ns2.openprovider.be',
  'ns3.openprovider.eu',
];

export class OpenproviderDnsAdapter implements DnsProviderPort {
  readonly provider = 'openprovider';

  constructor(private readonly client: OpenproviderClient) {}

  // Zones are addressed by domain name; the zone itself is created with its records in upsertRecords.
  ensureZone(domain: string): Promise<DnsZone> {
    return Promise.resolve({
      zoneId: domain,
      nameservers: [...OPENPROVIDER_NAMESERVERS],
    });
  }

  async deleteZone(domain: string): Promise<void> {
    if (!(await this.findZone(domain))) return;
    await this.client.delete(`dns/zones/${encodeURIComponent(domain)}`, {
      operation: 'DNS zone deletion',
    });
  }

  requestActivationCheck(): Promise<void> {
    return Promise.resolve();
  }

  async upsertRecords(domain: string, records: DnsRecord[]): Promise<void> {
    const { name, extension } = splitDomain(domain);
    const zone = await this.findZone(domain);

    if (!zone) {
      await this.client.post('dns/zones', {
        operation: 'DNS zone creation',
        body: {
          domain: { name, extension },
          type: 'master',
          records: records.map(toOpenproviderRecord),
        },
      });
      return;
    }

    const { add, remove } = diffRecords(domain, zone.records ?? [], records);
    // Separate calls: Openprovider rejects (400) a single update that removes and re-adds a CNAME of the same name.
    if (remove.length > 0) {
      await this.updateZone(domain, zone.id, { remove });
    }
    if (add.length > 0) {
      await this.updateZone(domain, zone.id, { add });
    }
  }

  private async updateZone(
    domain: string,
    zoneId: number,
    records: { add?: unknown[]; remove?: unknown[] },
  ): Promise<void> {
    const { name, extension } = splitDomain(domain);
    await this.client.put(`dns/zones/${encodeURIComponent(domain)}`, {
      operation: 'DNS zone update',
      body: { id: zoneId, name: domain, domain: { name, extension }, records },
    });
  }

  private async findZone(domain: string): Promise<Zone | null> {
    try {
      return await this.client.get<Zone>(
        `dns/zones/${encodeURIComponent(domain)}`,
        {
          operation: 'DNS zone lookup',
          query: { with_records: true },
        },
      );
    } catch (err) {
      if (err instanceof RegistrarApiException && err.httpStatus === 404)
        return null;
      throw err;
    }
  }
}

// Apex records are sent without a name, as in Openprovider's own zone examples.
function toOpenproviderRecord(
  record: DnsRecord,
): Record<string, string | number> {
  return {
    ...(record.name === '@' ? {} : { name: record.name }),
    type: record.type,
    value: record.value,
    ttl: record.ttl,
  };
}

function diffRecords(
  domain: string,
  existing: ZoneRecord[],
  desired: DnsRecord[],
): { add: Array<Record<string, string | number>>; remove: ZoneRecord[] } {
  const label = (name: string | undefined): string => {
    const n = (name ?? '').toLowerCase().replace(/\.$/, '');
    if (n === '' || n === '@' || n === domain) return '@';
    return n.endsWith(`.${domain}`) ? n.slice(0, -(domain.length + 1)) : n;
  };
  const value = (v: string): string => v.toLowerCase().replace(/\.$/, '');
  const matches = (r: ZoneRecord, d: DnsRecord): boolean =>
    r.type === d.type &&
    label(r.name) === d.name &&
    value(r.value) === value(d.value);

  const managedNames = new Set(desired.map((d) => d.name));
  const remove = existing
    .filter(
      (r) =>
        WEB_RECORD_TYPES.has(r.type) &&
        managedNames.has(label(r.name)) &&
        !desired.some((d) => matches(r, d)),
    )
    // Reads return FQDN names but removals only match the relative form used on writes.
    .map((r) => {
      const name = label(r.name);
      return {
        ...(name === '@' ? {} : { name }),
        type: r.type,
        value: r.value,
        ...(r.ttl !== undefined ? { ttl: r.ttl } : {}),
        ...(r.prio !== undefined ? { prio: r.prio } : {}),
      };
    });
  const add = desired
    .filter((d) => !existing.some((r) => matches(r, d)))
    .map(toOpenproviderRecord);
  return { add, remove };
}
