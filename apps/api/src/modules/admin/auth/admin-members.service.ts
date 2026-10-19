import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import { type AdminRole } from './admin-roles.decorator';

const MEMBER_CACHE_TTL_MS = 60_000;

const ADMIN_ROLES: readonly AdminRole[] = ['owner', 'operator', 'viewer'];

export interface AdminMember {
  userId: string;
  role: AdminRole;
}

interface MemberRow {
  role: string;
  revoked_at: string | Date | null;
}

interface CacheEntry {
  member: AdminMember | null;
  expiresAt: number;
}

@Injectable()
export class AdminMembersService {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findActiveMember(userId: string): Promise<AdminMember | null> {
    const hit = this.cache.get(userId);
    if (hit && hit.expiresAt > Date.now()) return hit.member;

    const member = await this.loadActive(userId);
    // Misses are cached too, so an unknown user does not hit Postgres per request.
    this.cache.set(userId, {
      member,
      expiresAt: Date.now() + MEMBER_CACHE_TTL_MS,
    });
    return member;
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  private async loadActive(userId: string): Promise<AdminMember | null> {
    const rows = (await this.db.execute(sql`
      SELECT role, revoked_at
      FROM admin.members
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `)) as unknown as MemberRow[];

    const row = rows[0];
    if (!row || row.revoked_at != null) return null;
    if (!isAdminRole(row.role)) return null;
    return { userId, role: row.role };
  }
}

function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}
