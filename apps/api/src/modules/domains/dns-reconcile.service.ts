import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import {
  DNS_PROVIDER_PORT,
  DNS_ZONE_INVENTORY_PORT,
  type DnsProviderPort,
  type DnsZoneInventoryPort,
} from './domain/dns-provider.port';

const DEFAULT_GRACE_MINUTES = 120;
const DEFAULT_MAX_DELETES = 5;
// A purchase that stalled this long with a zone attached deserves a human look.
const STALE_INCOMPLETE_HOURS = 24;

interface DomainRefRow {
  id: string;
  domain: string;
  source: string;
  dns_zone_id: string | null;
  purchase_completed_at: string | Date | null;
  dns_status: string;
  created_at: string | Date;
}

export interface ReconcileReport {
  skipped: boolean;
  deletedZones: string[];
  orphanZonesRefused: string[];
  rowsWithoutZone: string[];
  stalePurchaseRows: string[];
}

/**
 * Keeps the Cloudflare account and `public.domains` in agreement: a zone with no live row is deleted,
 * a live managed row without a zone is only reported. Assumes the account holds Lattiz tenant zones only
 * (anything else must be listed in DNS_RECONCILE_KEEP_ZONES).
 */
@Injectable()
export class DnsReconcileService {
  private readonly logger = new Logger(DnsReconcileService.name);
  private readonly enabled: boolean;
  private readonly graceMs: number;
  private readonly maxDeletes: number;
  private readonly keepZones: Set<string>;
  private running = false;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(DNS_PROVIDER_PORT) private readonly dns: DnsProviderPort,
    @Inject(DNS_ZONE_INVENTORY_PORT)
    private readonly inventory: DnsZoneInventoryPort | null,
    config: ConfigService,
  ) {
    this.enabled = config.get<string>('DNS_RECONCILE_ENABLED') === 'true';
    this.graceMs =
      positiveInt(
        config.get<string>('DNS_RECONCILE_GRACE_MINUTES'),
        DEFAULT_GRACE_MINUTES,
      ) * 60_000;
    this.maxDeletes = positiveInt(
      config.get<string>('DNS_RECONCILE_MAX_DELETES'),
      DEFAULT_MAX_DELETES,
    );
    this.keepZones = new Set(
      (config.get<string>('DNS_RECONCILE_KEEP_ZONES') ?? '')
        .split(',')
        .map((z) => z.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  @Cron('*/30 * * * *')
  async runScheduled(): Promise<void> {
    if (!this.enabled || !this.inventory || this.running) return;
    this.running = true;
    try {
      await this.reconcile();
    } catch (err) {
      this.logger.error(`[dns-reconcile] Run failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }

  async reconcile(now: Date = new Date()): Promise<ReconcileReport> {
    const report: ReconcileReport = {
      skipped: false,
      deletedZones: [],
      orphanZonesRefused: [],
      rowsWithoutZone: [],
      stalePurchaseRows: [],
    };
    if (!this.inventory) {
      report.skipped = true;
      return report;
    }

    const zones = await this.inventory.listZones();
    const rows = await this.query<DomainRefRow>(
      sql`SELECT id, domain, source, dns_zone_id, purchase_completed_at, dns_status, created_at
          FROM public.domains
          WHERE released_at IS NULL`,
    );
    const liveNames = new Set(rows.map((r) => r.domain.toLowerCase()));
    const liveZoneIds = new Set(
      rows.map((r) => r.dns_zone_id).filter((id): id is string => !!id),
    );

    const orphans = zones.filter((z) => {
      if (this.keepZones.has(z.name)) return false;
      if (liveZoneIds.has(z.zoneId) || liveNames.has(z.name)) return false;
      // A purchase creates its zone before it persists the id; give it time to land.
      // Unknown age is treated as young: never delete what we cannot date.
      return (
        z.createdAt !== null &&
        now.getTime() - z.createdAt.getTime() >= this.graceMs
      );
    });

    if (orphans.length > this.maxDeletes) {
      // More orphans than a bug-free system produces points at a wrong query or account, not at garbage.
      report.orphanZonesRefused = orphans.map((z) => z.name);
      this.logger.error(
        `[dns-reconcile] ${orphans.length} orphan zones exceed DNS_RECONCILE_MAX_DELETES=${this.maxDeletes}; deleting nothing: ${report.orphanZonesRefused.join(', ')}`,
      );
    } else {
      for (const zone of orphans) {
        // Re-checked right before deleting so a purchase that started meanwhile keeps its zone.
        if (await this.hasLiveRow(zone.zoneId, zone.name)) continue;
        try {
          await this.dns.deleteZone(zone.name);
          report.deletedZones.push(zone.name);
          this.logger.warn(
            `[dns-reconcile] Deleted orphan zone ${zone.name} (${zone.zoneId})`,
          );
        } catch (err) {
          this.logger.error(
            `[dns-reconcile] Could not delete orphan zone ${zone.name}: ${String(err)}`,
          );
        }
      }
    }

    const zoneIds = new Set(zones.map((z) => z.zoneId));
    for (const row of rows) {
      const age = now.getTime() - new Date(row.created_at).getTime();
      if (row.source === 'lattiz_managed' && row.purchase_completed_at) {
        if (!row.dns_zone_id || !zoneIds.has(row.dns_zone_id)) {
          report.rowsWithoutZone.push(row.domain);
          this.logger.warn(
            `[dns-reconcile] ${row.domain} is live but its zone ${row.dns_zone_id ?? '(none)'} does not exist at the provider`,
          );
        }
      } else if (
        row.source === 'lattiz_managed' &&
        row.dns_zone_id &&
        age > STALE_INCOMPLETE_HOURS * 3_600_000
      ) {
        report.stalePurchaseRows.push(row.domain);
        this.logger.warn(
          `[dns-reconcile] Purchase of ${row.domain} never completed and still holds zone ${row.dns_zone_id}`,
        );
      }
    }
    return report;
  }

  private async hasLiveRow(zoneId: string, name: string): Promise<boolean> {
    const rows = await this.query<{ id: string }>(
      sql`SELECT id FROM public.domains
          WHERE released_at IS NULL AND (dns_zone_id = ${zoneId} OR lower(domain) = ${name})
          LIMIT 1`,
    );
    return rows.length > 0;
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    return (await this.db.execute(statement)) as unknown as T[];
  }
}

function positiveInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
