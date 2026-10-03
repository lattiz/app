import { Logger } from '@nestjs/common';
import type {
  DnsProviderPort,
  DnsRecord,
  DnsZone,
} from '../../domain/dns-provider.port';

// Stands in for the Openprovider DNS adapter when purchases are mocked.
export class MockDnsAdapter implements DnsProviderPort {
  readonly provider = 'openprovider';
  private readonly logger = new Logger(MockDnsAdapter.name);

  ensureZone(domain: string): Promise<DnsZone> {
    this.logger.warn(`[MOCK] Skipping DNS zone creation for ${domain}`);
    return Promise.resolve({
      zoneId: `mock_${domain}`,
      nameservers: ['ns1.mock-dns.invalid', 'ns2.mock-dns.invalid'],
    });
  }

  upsertRecords(domain: string, records: DnsRecord[]): Promise<void> {
    this.logger.warn(
      `[MOCK] Skipping DNS records for ${domain} (${records.length} records)`,
    );
    return Promise.resolve();
  }

  deleteZone(domain: string): Promise<void> {
    this.logger.warn(`[MOCK] Skipping DNS zone deletion for ${domain}`);
    return Promise.resolve();
  }

  requestActivationCheck(): Promise<void> {
    return Promise.resolve();
  }
}
