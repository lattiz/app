export interface DnsRecord {
  type: 'A' | 'CNAME';
  /** '@' for the apex, otherwise the label before the domain (e.g. 'www'). */
  name: string;
  value: string;
  ttl: number;
}

export interface DnsProviderPort {
  /** Idempotent: creates the zone, or converges an existing one onto `records`. */
  upsertZone(domain: string, records: DnsRecord[]): Promise<void>;
}

export const DNS_PROVIDER_PORT = Symbol('DNS_PROVIDER_PORT');
