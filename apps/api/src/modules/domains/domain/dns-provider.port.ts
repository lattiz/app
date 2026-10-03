export interface DnsRecord {
  type: 'A' | 'CNAME';
  /** '@' for the apex, otherwise the label before the domain (e.g. 'www'). */
  name: string;
  value: string;
  /** Seconds. Providers with automatic-only TTLs ignore it. */
  ttl: number;
}

export interface DnsZone {
  /** Provider-side zone id (the domain name itself where the provider has no separate id). */
  zoneId: string;
  /** Nameservers the domain must delegate to for this zone to serve. */
  nameservers: string[];
}

export type DnsProviderName = 'cloudflare' | 'openprovider';

export interface DnsProviderPort {
  /** Persisted next to the zone id so a later provider switch never deletes with the wrong adapter. */
  readonly provider: DnsProviderName;

  /** Idempotent: finds the zone by name or creates it. */
  ensureZone(domain: string): Promise<DnsZone>;

  /**
   * Idempotent convergence of the managed records only: for each name in `records`
   * the A/AAAA/CNAME set becomes exactly `records`; every other record is left alone.
   */
  upsertRecords(domain: string, records: DnsRecord[]): Promise<void>;

  /** No-op when the zone does not exist. */
  deleteZone(domain: string): Promise<void>;

  /** Asks the provider to re-check nameserver delegation now; no-op where not applicable. */
  requestActivationCheck(domain: string): Promise<void>;
}

export const DNS_PROVIDER_PORT = Symbol('DNS_PROVIDER_PORT');

export interface DnsZoneSummary {
  zoneId: string;
  name: string;
  /** Null when the provider did not report it. */
  createdAt: Date | null;
}

/**
 * Enumerating every zone only makes sense where the account is dedicated to Lattiz zones (Cloudflare);
 * Openprovider zones hang off registrar domains, so it is a separate port instead of part of the main one.
 */
export interface DnsZoneInventoryPort {
  listZones(): Promise<DnsZoneSummary[]>;
}

export const DNS_ZONE_INVENTORY_PORT = Symbol('DNS_ZONE_INVENTORY_PORT');
