import { Module } from '@nestjs/common';
import { PreviewModule } from '../../common/billing/preview.module';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { HTML_SANITIZER } from './html-sanitizer.port';
import { SanitizeHtmlSanitizer } from './sanitize-html.sanitizer';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [DatabaseModule, PreviewModule, StorageModule],
  controllers: [SitesController],
  providers: [
    SitesService,
    { provide: HTML_SANITIZER, useClass: SanitizeHtmlSanitizer },
  ],
  exports: [SitesService],
})
export class SitesModule {}
