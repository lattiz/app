import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SitesController],
  providers: [SitesService, SupabaseStorageService],
  exports: [SitesService, SupabaseStorageService],
})
export class SitesModule {}
