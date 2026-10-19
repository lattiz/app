import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';

export interface AdminAuditRecord {
  actorUserId: string;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  reason?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async record(input: AdminAuditRecord): Promise<void> {
    try {
      await this.db.execute(sql`
        INSERT INTO admin.audit_log (
          actor_user_id,
          actor_email,
          action,
          target_type,
          target_id,
          reason,
          before,
          after,
          ip,
          user_agent
        ) VALUES (
          ${input.actorUserId}::uuid,
          ${input.actorEmail ?? null},
          ${input.action},
          ${input.targetType ?? null},
          ${input.targetId ?? null},
          ${input.reason ?? null},
          ${jsonb(input.before)},
          ${jsonb(input.after)},
          ${input.ip ?? null},
          ${input.userAgent ?? null}
        )
      `);
    } catch (error) {
      this.logger.error(
        `admin.audit_log insert failed (${input.action})`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}

function jsonb(value: unknown): SQL {
  if (value === undefined || value === null) return sql`NULL`;
  return sql`${JSON.stringify(value)}::jsonb`;
}
