import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { DNS_PROVIDER_PORT } from './domain/dns-provider.port';
import { REGISTRAR_PORT } from './domain/registrar.port';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { MockDnsAdapter } from './infrastructure/openprovider/mock-dns.adapter';
import { MockOpenproviderRegistrarAdapter } from './infrastructure/openprovider/mock-openprovider-registrar.adapter';
import { OpenproviderClient } from './infrastructure/openprovider/openprovider.client';
import { OpenproviderDnsAdapter } from './infrastructure/openprovider/openprovider-dns.adapter';
import { OpenproviderRegistrarAdapter } from './infrastructure/openprovider/openprovider-registrar.adapter';
import { VercelDomainsService } from './vercel-domains.service';

const isMockPurchases = (config: ConfigService): boolean =>
  config.get<string>('OPENPROVIDER_MOCK_PURCHASES') === 'true';

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
        isMockPurchases(config)
          ? new MockDnsAdapter()
          : new OpenproviderDnsAdapter(client),
    },
  ],
  exports: [DomainsService],
})
export class DomainsModule {}
