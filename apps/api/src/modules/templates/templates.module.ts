import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PublicTemplatesController } from './public-templates.controller';
import { TemplateAccessService } from './template-access.service';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TemplatesController, PublicTemplatesController],
  providers: [TemplatesService, TemplateAccessService],
  exports: [TemplatesService, TemplateAccessService],
})
export class TemplatesModule {}
