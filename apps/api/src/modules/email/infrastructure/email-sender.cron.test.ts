import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import type { SettingsStorePort } from '../../../common/settings/settings-store.port';
import { SettingsService } from '../../../common/settings/settings.service';
import type { EmailOutboxRepositoryPort } from '../domain/email-outbox.port';
import type { EmailProviderPort } from '../domain/email-provider.port';
import { EmailSenderCron } from './email-sender.cron';

function configFrom(
  env: Record<string, string | undefined> = {},
): ConfigService {
  return { get: (key: string) => env[key] } as unknown as ConfigService;
}

function settingsFor(
  rows: Map<string, unknown>,
  env: Record<string, string | undefined> = {},
): SettingsService {
  const store: SettingsStorePort = { loadAll: async () => new Map(rows) };
  return new SettingsService(configFrom(env), store);
}

describe('EmailSenderCron settings', () => {
  it('applies a database change between ticks and the per-run limit', async () => {
    const rows = new Map<string, unknown>([
      ['email.sending_enabled', false],
      ['email.max_per_run', 2],
    ]);
    const settings = settingsFor(rows, { EMAIL_MAX_PER_RUN: '9' });
    await settings.reload();

    const limits: number[] = [];
    const outbox = {
      claimDue: async (limit: number) => {
        limits.push(limit);
        return [];
      },
    } as unknown as EmailOutboxRepositoryPort;
    const provider = {
      send: async () => ({ ok: true, messageId: 'm' }),
    } as EmailProviderPort;
    const cron = new EmailSenderCron(
      outbox,
      provider,
      configFrom({}),
      settings,
    );

    await cron.tick();
    assert.deepEqual(limits, []);

    rows.set('email.sending_enabled', true);
    await settings.reload();
    await cron.tick();
    assert.deepEqual(limits, [2]);

    rows.set('email.max_per_run', 1);
    await settings.reload();
    await cron.tick();
    assert.deepEqual(limits, [2, 1]);
  });
});
