import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../../common/settings/settings.service';
import type { EmailOutboxService } from './email-outbox.service';
import { AdminAlertService } from './admin-alert.service';

const errors: string[] = [];
const originalError = Logger.prototype.error;

before(() => {
  Logger.prototype.error = ((message?: unknown) => {
    errors.push(String(message));
  }) as typeof Logger.prototype.error;
});

after(() => {
  Logger.prototype.error = originalError;
});

beforeEach(() => {
  errors.length = 0;
});

async function settingsFor(email: string | null): Promise<SettingsService> {
  const rows = new Map<string, unknown>();
  if (email !== null) rows.set('alerts.admin_email', email);
  const settings = new SettingsService(
    { get: () => undefined } as unknown as ConfigService,
    { loadAll: async () => rows },
  );
  await settings.reload();
  return settings;
}

describe('AdminAlertService', () => {
  it('only logs when the admin address is empty', async () => {
    const enqueued: string[] = [];
    const emails = {
      enqueue: async () => {
        enqueued.push('called');
        return true;
      },
    } as unknown as EmailOutboxService;
    const service = new AdminAlertService(await settingsFor(''), emails);
    await service.alert({
      key: 'renewal_failed:cycle-1',
      title: 'Renovación fallida',
      summary: 'Hay que renovar a mano.',
      details: { ciclo: 'cycle-1' },
    });
    assert.deepEqual(enqueued, []);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /\[ADMIN_ALERT\] Renovación fallida/);
    assert.match(errors[0], /key=renewal_failed:cycle-1/);
  });

  it('enqueues one admin_alert with the admin key', async () => {
    const enqueued: Array<{ kind: string; to: string; key: string }> = [];
    const emails = {
      enqueue: async (
        kind: string,
        to: string,
        _data: Record<string, unknown>,
        key: string,
      ) => {
        enqueued.push({ kind, to, key });
        return true;
      },
    } as unknown as EmailOutboxService;
    const service = new AdminAlertService(
      await settingsFor('ops@lattiz.app'),
      emails,
    );
    await service.alert({
      key: 'renewal_failed:cycle-1',
      title: 'Renovación fallida',
      summary: 'Hay que renovar a mano.',
      details: { ciclo: 'cycle-1', monto: 69484, nota: null },
      tenantId: '22222222-2222-4222-8222-222222222222',
    });
    assert.deepEqual(enqueued, [
      {
        kind: 'admin_alert',
        to: 'ops@lattiz.app',
        key: 'admin:renewal_failed:cycle-1',
      },
    ]);
    assert.match(errors[0], /key=renewal_failed:cycle-1/);
    assert.match(errors[0], /monto=69484/);
    assert.match(errors[0], /nota=null/);
  });

  it('does not throw when the outbox fails', async () => {
    const emails = {
      enqueue: async () => {
        throw new Error('outbox down');
      },
    } as unknown as EmailOutboxService;
    const service = new AdminAlertService(
      await settingsFor('ops@lattiz.app'),
      emails,
    );
    await assert.doesNotReject(() =>
      service.alert({
        key: 'renewal_dns:cycle-1',
        title: 'DNS',
        summary: 'Hay que redelegar.',
        details: {},
      }),
    );
    assert.ok(errors.some((line) => line.includes('Failed to enqueue')));
  });
});
