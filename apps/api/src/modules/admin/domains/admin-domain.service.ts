import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import { DomainsService } from '../../domains/domains.service';
import type { DomainInspection } from '../../domains/domain-inspection';
import { AdminNotFoundException } from '../admin.exceptions';
import type { AdminDomainInspectionDto } from './admin-domain.dto';

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  at: number;
  value: DomainInspection;
}

@Injectable()
export class AdminDomainService {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly domains: DomainsService,
  ) {}

  async inspect(
    tenantId: string,
    refresh: boolean,
    now = Date.now(),
  ): Promise<AdminDomainInspectionDto> {
    await this.requireTenant(tenantId);
    if (!refresh) {
      const hit = this.cache.get(tenantId);
      if (hit && now - hit.at < CACHE_TTL_MS) {
        return hit.value;
      }
    }
    const value = await this.domains.inspectForTenant(tenantId);
    this.cache.set(tenantId, { at: now, value });
    return value;
  }

  async activationCheck(tenantId: string): Promise<AdminDomainInspectionDto> {
    const userId = await this.requireTenant(tenantId);
    await this.domains.checkDnsStatus(userId);
    this.cache.delete(tenantId);
    return this.inspect(tenantId, true);
  }

  private async requireTenant(tenantId: string): Promise<string> {
    const rows = (await this.db.execute(
      sql`SELECT user_id FROM public.tenants WHERE id = ${tenantId}::uuid LIMIT 1`,
    )) as unknown as { user_id: string }[];
    const userId = rows[0]?.user_id;
    if (!userId) throw new AdminNotFoundException();
    return userId;
  }
}
