import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DrizzleSettingsStore } from './drizzle-settings.store';
import { SETTINGS_STORE } from './settings-store.port';
import { SettingsService } from './settings.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    SettingsService,
    { provide: SETTINGS_STORE, useClass: DrizzleSettingsStore },
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
