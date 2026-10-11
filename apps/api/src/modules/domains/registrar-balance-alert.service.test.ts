import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { SettingsService } from '../../common/settings/settings.service';
import type { Database } from '../../database/database.module';
import type { AdminAlertService } from '../email/application/admin-alert.service';
import { DomainRenewalConfig } from './domain-renewal.config';
import type { RegistrarPort } from './domain/registrar.port';
import { RegistrarBalanceAlertService } from './registrar-balance-alert.service';

const dialect = new PgDialect();
const NOW = new Date('2026-06-15T12:00:00.000Z');

interface DueRow {
  domain: string;
  expires_at: Date;
}

interface HarnessOptions {
  enabled?: boolean;
  rows?: DueRow[];
  balance?: number;
  failDomains?: string[];
  balanceError?: Error;
}

function due(domain: string, daysAhead: number): DueRow {
  return {
    domain,
    expires_at: new Date(NOW.getTime() + daysAhead * 86_400_000),
  };
}

async function harness(options: HarnessOptions = {}) {
  const settings = new SettingsService(
    { get: () => undefined } as unknown as ConfigService,
    {
      loadAll: async () =>
        new Map<string, unknown>([
          ['domain.renewal.enabled', options.enabled !== false],
        ]),
    },
  );
  await settings.reload();
  const config = new DomainRenewalConfig(settings);

  const calls: string[] = [];
  const db = {
    execute: async (statement: SQL) => {
      const query = dialect.sqlToQuery(statement);
      assert.ok(
        query.params.every((param) => !(param instanceof Date)),
        'a Date was bound as a raw SQL parameter',
      );
      calls.push(query.sql);
      assert.match(query.sql, /lattiz_managed/);
      assert.match(query.sql, /is_mock = false/);
      assert.match(query.sql, /status = 'paid'/);
      assert.match(query.sql, /LIMIT/);
      return options.rows ?? [];
    },
  } as unknown as Database;

  const priced: string[] = [];
  let inFlight = 0;
  let maxInFlight = 0;
  let balanceCalls = 0;
  const registrar = {
    getPriceUsdCents: async (domain: string) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      priced.push(domain);
      if (options.failDomains?.includes(domain)) throw new Error('429');
      return 1000;
    },
    getBalance: async () => {
      balanceCalls += 1;
      if (options.balanceError) throw options.balanceError;
      return { availableCents: options.balance ?? 0 };
    },
  } as unknown as RegistrarPort;

  const alerts: Array<{
    key: string;
    summary: string;
    details: Record<string, string | number | null>;
  }> = [];
  const adminAlerts = {
    alert: async (input: (typeof alerts)[number]) => {
      alerts.push(input);
    },
  } as unknown as AdminAlertService;

  return {
    service: new RegistrarBalanceAlertService(
      db,
      registrar,
      config,
      adminAlerts,
    ),
    calls,
    priced,
    alerts,
    balanceCalls: () => balanceCalls,
    maxInFlight: () => maxInFlight,
  };
}

describe('RegistrarBalanceAlertService', () => {
  it('does not query when renewal is disabled', async () => {
    const { service, calls, priced, balanceCalls } = await harness({
      enabled: false,
      rows: [due('cafe.mx', 10)],
    });
    await service.run(NOW);
    assert.equal(calls.length, 0);
    assert.equal(priced.length, 0);
    assert.equal(balanceCalls(), 0);
  });

  it('does not call the registrar when no domain is in the window', async () => {
    const { service, calls, priced, balanceCalls, alerts } = await harness({
      rows: [],
    });
    await service.run(NOW);
    assert.equal(calls.length, 1);
    assert.equal(priced.length, 0);
    assert.equal(balanceCalls(), 0);
    assert.equal(alerts.length, 0);
  });

  it('stays quiet when the balance covers the sum', async () => {
    const { service, alerts, balanceCalls, maxInFlight } = await harness({
      rows: [due('cafe.mx', 10), due('norte.mx', 20)],
      balance: 5000,
    });
    await service.run(NOW);
    assert.equal(alerts.length, 0);
    assert.equal(balanceCalls(), 1);
    assert.equal(maxInFlight(), 1);
  });

  it('alerts when the balance is short, and a failed price does not break the sum', async () => {
    const { service, alerts, priced } = await harness({
      rows: [due('cafe.mx', 3), due('norte.mx', 4)],
      failDomains: ['cafe.mx'],
      balance: 500,
    });
    await assert.doesNotReject(() => service.run(NOW));
    assert.deepEqual(priced, ['cafe.mx', 'norte.mx']);
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].key, 'registrar_balance:2026-06-15');
    assert.match(alerts[0].summary, /Openprovider/);
    assert.match(alerts[0].summary, /USD/);
    assert.equal(alerts[0].details.suma_necesaria_centavos, 1000);
    assert.equal(alerts[0].details.precios_desconocidos, 1);
    assert.equal(alerts[0].details.saldo_disponible_centavos, 500);
    assert.match(String(alerts[0].details.lista), /cafe\.mx/);
    assert.match(String(alerts[0].details.lista), /norte\.mx/);
  });

  it('prices at most 50 domains', async () => {
    const rows = Array.from({ length: 51 }, (_, index) =>
      due(`d${index}.mx`, 1),
    );
    const { service, priced } = await harness({ rows, balance: 1_000_000 });
    await service.run(NOW);
    assert.equal(priced.length, 50);
  });

  it('does not throw when the balance lookup fails', async () => {
    const { service, alerts } = await harness({
      rows: [due('cafe.mx', 2)],
      balanceError: new Error('balance down'),
    });
    await assert.doesNotReject(() => service.run(NOW));
    assert.equal(alerts.length, 0);
  });
});
