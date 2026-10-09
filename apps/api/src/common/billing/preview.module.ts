import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { PreviewCapabilityService } from './preview-capability.service';
import { PreviewConfig } from './preview.config';

@Module({
  imports: [SettingsModule],
  providers: [PreviewConfig, PreviewCapabilityService],
  exports: [PreviewConfig, PreviewCapabilityService],
})
export class PreviewModule {}
