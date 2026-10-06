import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PublicTemplatesController } from './public-templates.controller';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TemplatesController, PublicTemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
