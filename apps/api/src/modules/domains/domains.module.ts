import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsModule } from '../../common/settings/settings.module';
import { SettingsService } from '../../common/settings/settings.service';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';
import {
  DNS_PROVIDER_PORT,
  DNS_ZONE_INVENTORY_PORT,
  type DnsProviderPort,
} from './domain/dns-provider.port';
import { DOMAIN_PRICE_CAPS } from './domain/domain-pricing.policy';
import { REGISTRAR_PORT, type RegistrarPort } from './domain/registrar.port';
import { parseDomainPriceCaps } from './domain-pricing.config';
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

// domains.mock_purchases is fixed at startup; changing the row requires an API restart.
async function mockPurchasesEnabled(
  settings: SettingsService,
): Promise<boolean> {
  await settings.ready();
  return settings.getBool('domains.mock_purchases');
}

export async function createRegistrarAdapter(
  client: OpenproviderClient,
  config: ConfigService,
  settings: SettingsService,
): Promise<RegistrarPort> {
  const handle = config.get<string>('OPENPROVIDER_CUSTOMER_HANDLE') ?? '';
  return (await mockPurchasesEnabled(settings))
    ? new MockOpenproviderRegistrarAdapter(client, handle)
    : new OpenproviderRegistrarAdapter(client, handle);
}

// Cloudflare is used for real even with mocked purchases, so real zones can be tested against a fake registrar.
async function createDnsProvider(
  client: OpenproviderClient,
  config: ConfigService,
  settings: SettingsService,
): Promise<DnsProviderPort> {
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
  return (await mockPurchasesEnabled(settings))
    ? new MockDnsAdapter()
    : new OpenproviderDnsAdapter(client);
}

@Module({
  imports: [DatabaseModule, EmailModule, SettingsModule],
  controllers: [DomainsController],
  providers: [
    DomainsService,
    OpenproviderClient,
    VercelDomainsService,
    {
      provide: DOMAIN_PRICE_CAPS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        parseDomainPriceCaps((key) => config.get<string>(key)),
    },
    {
      provide: REGISTRAR_PORT,
      inject: [OpenproviderClient, ConfigService, SettingsService],
      useFactory: (
        client: OpenproviderClient,
        config: ConfigService,
        settings: SettingsService,
      ) => createRegistrarAdapter(client, config, settings),
    },
    {
      provide: DNS_PROVIDER_PORT,
      inject: [OpenproviderClient, ConfigService, SettingsService],
      useFactory: (
        client: OpenproviderClient,
        config: ConfigService,
        settings: SettingsService,
      ) => createDnsProvider(client, config, settings),
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
