import { Inject, Injectable } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import type { AdminAuditEntryDto, AdminAuditQueryDto } from './admin-audit.dto';
import {
  auditListStatements,
  clipUserAgent,
  type AuditListQuery,
} from './admin-audit.queries';

interface AuditRow {
  id: number | string;
  actor_user_id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  user_agent: string | null;
  created_at: string | Date;
}

export interface AuditPage {
  items: AdminAuditEntryDto[];
  total: number;
  page: number;
  pageSize: number;
}

interface SqlExecutor {
  execute(statement: SQL): Promise<unknown>;
}

@Injectable()
export class AdminAuditLogService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(query: AdminAuditQueryDto): Promise<AuditPage> {
    const statements = auditListStatements(toQuery(query));
    const [rows, totals] = await Promise.all([
      this.query<AuditRow>(statements.items),
      this.query<{ total: number | string }>(statements.count),
    ]);
    return {
      items: rows.map(mapAudit),
      total: Number(totals[0]?.total ?? 0),
      page: statements.page,
      pageSize: statements.pageSize,
    };
  }

  private async query<T>(
    statement: SQL,
    executor: SqlExecutor = this.db,
  ): Promise<T[]> {
    const rows = await executor.execute(statement);
    return rows as unknown as T[];
  }
}

function toQuery(query: AdminAuditQueryDto): AuditListQuery {
  return {
    actor: query.actor,
    action: query.action,
    targetType: query.targetType,
    targetId: query.targetId,
    from: query.from,
    to: query.to,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function mapAudit(row: AuditRow): AdminAuditEntryDto {
  return {
    id: String(row.id),
    actorUserId: row.actor_user_id,
    actorEmail: row.actor_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    before: row.before ?? null,
    after: row.after ?? null,
    ip: row.ip,
    userAgent: clipUserAgent(row.user_agent),
    createdAt: toIso(row.created_at),
  };
}

function toIso(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}
