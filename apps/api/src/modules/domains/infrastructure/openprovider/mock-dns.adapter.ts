import { Logger } from '@nestjs/common';
import type {
  DnsProviderPort,
  DnsRecord,
} from '../../domain/dns-provider.port';

export class MockDnsAdapter implements DnsProviderPort {
  private readonly logger = new Logger(MockDnsAdapter.name);

  upsertZone(domain: string, records: DnsRecord[]): Promise<void> {
    this.logger.warn(
      `[MOCK] Skipping DNS zone for ${domain} (${records.length} records)`,
    );
    return Promise.resolve();
  }
}
