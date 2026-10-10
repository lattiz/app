import { Module } from '@nestjs/common';
import { PreviewModule } from '../../common/billing/preview.module';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { TemplatesModule } from '../templates/templates.module';
import { TenantSlugService } from './tenant-slug.service';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [DatabaseModule, PreviewModule, StorageModule, TemplatesModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantSlugService],
  exports: [TenantsService],
})
export class TenantsModule {}
