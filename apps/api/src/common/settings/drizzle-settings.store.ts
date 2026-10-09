import { Inject, Injectable } from '@nestjs/common';
import { type Database, DATABASE } from '../../database/database.module';
import { appSettings } from '../../database/schema';
import { type SettingsStorePort } from './settings-store.port';

@Injectable()
export class DrizzleSettingsStore implements SettingsStorePort {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async loadAll(): Promise<ReadonlyMap<string, unknown>> {
    const rows = await this.db
      .select({ key: appSettings.key, value: appSettings.value })
      .from(appSettings);
    const snapshot = new Map<string, unknown>();
    for (const row of rows) snapshot.set(row.key, row.value);
    return snapshot;
  }
}
