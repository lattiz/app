import 'reflect-metadata';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../common/settings/settings.service';
import type { Database } from '../../database/database.module';
import type {
  DnsProviderPort,
  DnsZoneInventoryPort,
  DnsZoneSummary,
} from './domain/dns-provider.port';
import { DnsReconcileService } from './dns-reconcile.service';

const NOW = new Date('2026-06-15T12:00:00.000Z');

function settingsFor(rows: Map<string, unknown>): SettingsService {
  const config = { get: () => undefined } as unknown as ConfigService;
  return new SettingsService(config, { loadAll: async () => new Map(rows) });
}

function zones(): DnsZoneSummary[] {
  return [
    {
      zoneId: 'keep',
      name: 'lattiz.app',
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
    },
    {
      zoneId: 'orphan',
      name: 'orphan.test',
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
    },
  ];
}

describe('DnsReconcileService settings', () => {
  it('reads enabled, keep_zones, grace and the delete cap on each run', async () => {
    const rows = new Map<string, unknown>([
      ['dns.reconcile.enabled', false],
      ['dns.reconcile.grace_minutes', 120],
      ['dns.reconcile.max_deletes', 5],
      ['dns.reconcile.keep_zones', ['Lattiz.app']],
    ]);
    const settings = settingsFor(rows);
    await settings.reload();

    let listed = 0;
    const deleted: string[] = [];
    let currentZones = zones();
    const inventory: DnsZoneInventoryPort = {
      listZones: async () => {
        listed += 1;
        return currentZones;
      },
    };
    const dns = {
      deleteZone: async (name: string) => {
        deleted.push(name);
      },
    } as DnsProviderPort;
    const db = { execute: async () => [] } as unknown as Database;
    const service = new DnsReconcileService(db, dns, inventory, settings);

    await service.runScheduled();
    const skipped = await service.reconcile(NOW);
    assert.equal(listed, 0);
    assert.equal(skipped.skipped, true);
    assert.deepEqual(deleted, []);

    rows.set('dns.reconcile.enabled', true);
    await settings.reload();
    const kept = await service.reconcile(NOW);
    assert.equal(listed, 1);
    assert.deepEqual(deleted, ['orphan.test']);
    assert.deepEqual(kept.deletedZones, ['orphan.test']);

    const young: DnsZoneSummary = {
      zoneId: 'young',
      name: 'young.test',
      createdAt: new Date(NOW.getTime() - 30 * 60_000),
    };
    currentZones = [young];
    rows.set('dns.reconcile.keep_zones', []);
    rows.set('dns.reconcile.grace_minutes', 120);
    await settings.reload();
    const withinGrace = await service.reconcile(NOW);
    assert.deepEqual(withinGrace.deletedZones, []);

    rows.set('dns.reconcile.grace_minutes', 1);
    await settings.reload();
    const pastGrace = await service.reconcile(NOW);
    assert.deepEqual(pastGrace.deletedZones, ['young.test']);

    deleted.length = 0;
    currentZones = zones();
    rows.set('dns.reconcile.max_deletes', 1);
    await settings.reload();
    const capped = await service.reconcile(NOW);
    assert.deepEqual(deleted, []);
    assert.deepEqual(capped.orphanZonesRefused, ['lattiz.app', 'orphan.test']);
  });
});
