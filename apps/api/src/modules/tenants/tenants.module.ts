import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SitesModule } from '../sites/sites.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [DatabaseModule, SitesModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
