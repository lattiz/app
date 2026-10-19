import type { ConfigService } from '@nestjs/config';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { SettingsService } from '../../../common/settings/settings.service';
import type { Database } from '../../../database/database.module';
import {
  SettingUnknownException,
  SettingValueInvalidException,
} from '../admin.exceptions';
import { AdminSettingsService } from './admin-settings.service';

const dialect = new PgDialect();

interface StoredSetting {
  key: string;
  value: unknown;
  updated_by: string | null;
  updated_at: string | null;
}

describe('AdminSettingsService', () => {
  const stored: StoredSetting[] = [];
  const reload = jest.fn().mockResolvedValue(undefined);
  const execute = jest.fn(async (statement: SQL) => {
    const rendered = dialect.sqlToQuery(statement);
    const text = rendered.sql.replace(/\s+/g, ' ');
    if (text.includes('DELETE FROM')) {
      const key = rendered.params[0];
      const index = stored.findIndex((row) => row.key === key);
      if (index >= 0) stored.splice(index, 1);
      return [];
    }
    if (text.includes('INSERT INTO')) {
      const [key, raw, updatedBy] = rendered.params;
      const value = JSON.parse(String(raw));
      const next: StoredSetting = {
        key: String(key),
        value,
        updated_by: updatedBy == null ? null : String(updatedBy),
        updated_at: '2026-10-17T12:00:00.000Z',
      };
      const index = stored.findIndex((row) => row.key === next.key);
      if (index >= 0) stored.splice(index, 1, next);
      else stored.push(next);
      return [];
    }
    return stored.map((row) => ({ ...row }));
  });

  const service = new AdminSettingsService(
    { execute } as unknown as Database,
    { get: (name: string) => env[name] } as unknown as ConfigService,
    { reload } as unknown as SettingsService,
  );

  let env: Record<string, string | undefined> = {};

  beforeEach(() => {
    stored.length = 0;
    env = {};
    reload.mockClear();
    execute.mockClear();
  });

  it('reports db, env, and default through list()', async () => {
    stored.push({
      key: 'preview.enabled',
      value: false,
      updated_by: 'ana@lattiz.test',
      updated_at: '2026-10-17T00:00:00.000Z',
    });
    env.PREVIEW_TRIAL_DAYS = '9';

    const items = await service.list();
    const enabled = items.find((item) => item.key === 'preview.enabled');
    const days = items.find((item) => item.key === 'preview.trial_days');
    const batch = items.find((item) => item.key === 'preview.notify_batch');

    expect(enabled).toMatchObject({
      source: 'db',
      effectiveValue: false,
      dbValue: false,
      group: 'preview',
      updatedBy: 'ana@lattiz.test',
    });
    expect(days).toMatchObject({
      source: 'env',
      effectiveValue: 9,
      envValue: '9',
      dbValue: null,
    });
    expect(batch).toMatchObject({
      source: 'default',
      effectiveValue: 50,
      envValue: null,
      dbValue: null,
    });
  });

  it('rejects an out-of-range value with the registry error and does not reload', async () => {
    const error = await service
      .update('preview.trial_days', 999, 'ana@lattiz.test')
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(SettingValueInvalidException);
    expect((error as SettingValueInvalidException).status).toBe(400);
    expect((error as SettingValueInvalidException).message).toBe(
      'from 1 to 365',
    );
    expect(reload).not.toHaveBeenCalled();
    expect(stored).toHaveLength(0);
  });

  it('returns 404 for a key outside the registry', async () => {
    await expect(
      service.update('not.a.setting', 1, 'ana@lattiz.test'),
    ).rejects.toBeInstanceOf(SettingUnknownException);
    await expect(service.remove('not.a.setting')).rejects.toMatchObject({
      status: 404,
    });
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads after a write and after a delete, storing the actor email', async () => {
    const updated = await service.update(
      'preview.trial_days',
      9,
      'ana@lattiz.test',
    );
    expect(updated.entry).toMatchObject({
      source: 'db',
      effectiveValue: 9,
      updatedBy: 'ana@lattiz.test',
    });
    expect(updated.before).toBeNull();
    expect(updated.after).toBe(9);

    const removed = await service.remove('preview.trial_days');
    expect(removed.before).toBe(9);
    expect(removed.after).toBeNull();
    expect(removed.entry.source).toBe('default');
    expect(removed.entry.effectiveValue).toBe(14);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
