import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import {
  DNS_PROVIDER_PORT,
  DNS_ZONE_INVENTORY_PORT,
  type DnsProviderPort,
} from './domain/dns-provider.port';
import { REGISTRAR_PORT } from './domain/registrar.port';
import { DnsReconcileService } from './dns-reconcile.service';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { CloudflareClient } from './infrastructure/cloudflare/cloudflare.client';
import { CloudflareDnsAdapter } from './infrastructure/cloudflare/cloudflare-dns.adapter';
import { MockDnsAdapter } from './infrastructure/openprovider/mock-dns.adapter';
import { MockOpenproviderRegistrarAdapter } from './infrastructure/openprovider/mock-openprovider-registrar.adapter';
import { OpenproviderClient } from './infrastructure/openprovider/openprovider.client';
import { OpenproviderDnsAdapter } from './infrastructure/openprovider/openprovider-dns.adapter';
import { OpenproviderRegistrarAdapter } from './infrastructure/openprovider/openprovider-registrar.adapter';
import { VercelDomainsService } from './vercel-domains.service';

const isMockPurchases = (config: ConfigService): boolean =>
  config.get<string>('OPENPROVIDER_MOCK_PURCHASES') === 'true';

// Cloudflare is used for real even with mocked purchases, so real zones can be tested against a fake registrar.
function createDnsProvider(
  config: ConfigService,
  openproviderClient: OpenproviderClient,
): DnsProviderPort {
  const provider = (config.get<string>('DNS_PROVIDER') ?? '')
    .trim()
    .toLowerCase();

  if (provider === 'cloudflare') {
    const token = config.get<string>('CLOUDFLARE_API_TOKEN')?.trim();
    const accountId = config.get<string>('CLOUDFLARE_ACCOUNT_ID')?.trim();
    if (!token || !accountId) {
      throw new Error(
        'DNS_PROVIDER=cloudflare requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to be set.',
      );
    }
    return new CloudflareDnsAdapter(new CloudflareClient(token, accountId));
  }

  if (provider !== '' && provider !== 'openprovider') {
    throw new Error(
      `Unknown DNS_PROVIDER "${provider}"; expected "cloudflare" or "openprovider".`,
    );
  }
  return isMockPurchases(config)
    ? new MockDnsAdapter()
    : new OpenproviderDnsAdapter(openproviderClient);
}

@Module({
  imports: [DatabaseModule],
  controllers: [DomainsController],
  providers: [
    DomainsService,
    OpenproviderClient,
    VercelDomainsService,
    {
      provide: REGISTRAR_PORT,
      inject: [OpenproviderClient, ConfigService],
      useFactory: (client: OpenproviderClient, config: ConfigService) => {
        const handle = config.get<string>('OPENPROVIDER_CUSTOMER_HANDLE') ?? '';
        return isMockPurchases(config)
          ? new MockOpenproviderRegistrarAdapter(client, handle)
          : new OpenproviderRegistrarAdapter(client, handle);
      },
    },
    {
      provide: DNS_PROVIDER_PORT,
      inject: [OpenproviderClient, ConfigService],
      useFactory: (client: OpenproviderClient, config: ConfigService) =>
        createDnsProvider(config, client),
    },
    {
      provide: DNS_ZONE_INVENTORY_PORT,
      inject: [DNS_PROVIDER_PORT],
      // Only Cloudflare can enumerate a Lattiz-only account; the reconciler is idle otherwise.
      useFactory: (dns: DnsProviderPort) =>
        dns instanceof CloudflareDnsAdapter ? dns : null,
    },
    DnsReconcileService,
  ],
  exports: [DomainsService],
})
export class DomainsModule {}
