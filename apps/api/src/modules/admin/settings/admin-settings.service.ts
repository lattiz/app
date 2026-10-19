import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql, type SQL } from 'drizzle-orm';
import { SettingsService } from '../../../common/settings/settings.service';
import { type Database, DATABASE } from '../../../database/database.module';
import {
  SettingUnknownException,
  SettingValueInvalidException,
} from '../admin.exceptions';
import {
  describeSettings,
  parseSettingValue,
  settingDefinition,
  trialContext,
  type SettingRow,
  type SettingView,
} from './admin-settings.describe';
import type { SettingValue } from './admin-settings.dto';

interface SettingDbRow {
  key: string;
  value: SettingValue;
  updated_by: string | null;
  updated_at: string | Date | null;
}

export interface SettingChange {
  before: unknown;
  after: unknown;
  entry: SettingView;
}

interface SqlExecutor {
  execute(statement: SQL): Promise<unknown>;
}

@Injectable()
export class AdminSettingsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

  async list(): Promise<SettingView[]> {
    return describeSettings(await this.loadRows(), (name) =>
      this.readEnv(name),
    );
  }

  async update(
    key: string,
    value: unknown,
    updatedBy: string,
  ): Promise<SettingChange> {
    const def = this.definition(key);
    const rows = await this.loadRows();
    const ctx = trialContext(rows, (name) => this.readEnv(name));
    const parsed = parseSettingValue(
      def,
      value,
      def.type === 'int' && def.deriveFromTrial ? ctx : { trialDays: 0 },
    );
    if (!parsed.ok) throw new SettingValueInvalidException(parsed.message);
    const previous = rows.get(key);
    await this.query(sql`
      INSERT INTO public.app_settings (key, value, updated_by)
      VALUES (${key}, ${JSON.stringify(parsed.value)}::jsonb, ${updatedBy})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_by = EXCLUDED.updated_by
    `);
    await this.reloadSettings();
    return {
      before: previous ? previous.value : null,
      after: parsed.value,
      entry: await this.entry(key),
    };
  }

  async remove(key: string): Promise<SettingChange> {
    this.definition(key);
    const previous = (await this.loadRows()).get(key);
    await this.query(sql`
      DELETE FROM public.app_settings
      WHERE key = ${key}
    `);
    await this.reloadSettings();
    return {
      before: previous ? previous.value : null,
      after: null,
      entry: await this.entry(key),
    };
  }

  private definition(key: string) {
    const def = settingDefinition(key);
    if (!def) throw new SettingUnknownException(key);
    return def;
  }

  private async entry(key: string): Promise<SettingView> {
    const view = (await this.list()).find((item) => item.key === key);
    if (!view) throw new SettingUnknownException(key);
    return view;
  }

  private async loadRows(): Promise<Map<string, SettingRow>> {
    const rows = await this.query<SettingDbRow>(sql`
      SELECT key, value, updated_by, updated_at
      FROM public.app_settings
    `);
    const map = new Map<string, SettingRow>();
    for (const row of rows) {
      map.set(row.key, {
        value: row.value,
        updatedBy: row.updated_by,
        updatedAt: toIso(row.updated_at),
      });
    }
    return map;
  }

  private readEnv(name: string): string | undefined {
    const value = this.config.get<string>(name);
    return typeof value === 'string' ? value : undefined;
  }

  private async reloadSettings(): Promise<void> {
    // One VM: reload() is enough; app_setting_int/bool read the table live, other instances wait for their interval.
    await this.settings.reload();
  }

  private async query<T>(
    statement: SQL,
    executor: SqlExecutor = this.db,
  ): Promise<T[]> {
    const rows = await executor.execute(statement);
    return rows as unknown as T[];
  }
}

function toIso(value: string | Date | null): string | null {
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
