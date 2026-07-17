import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { GodaddyService } from './godaddy.service';
import { VercelDomainsService } from './vercel-domains.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DomainsController],
  providers: [DomainsService, GodaddyService, VercelDomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
