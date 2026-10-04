import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import type { EmailKind } from '../domain/email-kinds';
import type {
  EmailOutboxRecord,
  EmailOutboxRepositoryPort,
  InsertOutboxParams,
} from '../domain/email-outbox.port';

interface OutboxDbRow {
  id: string;
  kind: string;
  idempotency_key: string;
  to_email: string;
  tenant_id: string | null;
  payload: Record<string, unknown> | null;
  status: string;
  attempts: number;
  next_attempt_at: string | Date;
  last_error: string | null;
  provider_message_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  sent_at: string | Date | null;
}

@Injectable()
export class DrizzleEmailOutboxRepository implements EmailOutboxRepositoryPort {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async insertIgnore(params: InsertOutboxParams): Promise<boolean> {
    const tenantSql =
      params.tenantId === null ? sql`NULL` : sql`${params.tenantId}::uuid`;
    const rows = await this.query<{ id: string }>(
      sql`INSERT INTO public.email_outbox (
            kind, idempotency_key, to_email, tenant_id, payload
          ) VALUES (
            ${params.kind},
            ${params.idempotencyKey},
            ${params.toEmail},
            ${tenantSql},
            ${JSON.stringify(params.payload)}::jsonb
          )
          ON CONFLICT (idempotency_key) DO NOTHING
          RETURNING id`,
    );
    return rows.length > 0;
  }

  async claimDue(limit: number): Promise<EmailOutboxRecord[]> {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const rows = await this.query<OutboxDbRow>(
      sql`UPDATE public.email_outbox AS e
          SET status = 'sending', updated_at = now()
          WHERE e.id IN (
            SELECT id FROM public.email_outbox
            WHERE (
              (status = 'pending' AND next_attempt_at <= now())
              OR (status = 'sending' AND updated_at < now() - interval '15 minutes')
            )
            ORDER BY next_attempt_at ASC, created_at ASC
            FOR UPDATE SKIP LOCKED
            LIMIT ${safeLimit}
          )
          RETURNING
            id, kind, idempotency_key, to_email, tenant_id, payload,
            status, attempts, next_attempt_at, last_error, provider_message_id,
            created_at, updated_at, sent_at`,
    );
    return rows.map(mapRow);
  }

  async markSent(id: string, providerMessageId: string): Promise<void> {
    await this.query(
      sql`UPDATE public.email_outbox
          SET status = 'sent',
              provider_message_id = ${providerMessageId},
              sent_at = now(),
              last_error = NULL,
              updated_at = now()
          WHERE id = ${id}::uuid`,
    );
  }

  async markFailed(id: string, lastError: string): Promise<void> {
    await this.query(
      sql`UPDATE public.email_outbox
          SET status = 'failed',
              last_error = ${lastError.slice(0, 2000)},
              updated_at = now()
          WHERE id = ${id}::uuid`,
    );
  }

  async markRetry(
    id: string,
    attempts: number,
    nextAttemptAt: Date,
    lastError: string,
  ): Promise<void> {
    await this.query(
      sql`UPDATE public.email_outbox
          SET status = 'pending',
              attempts = ${attempts},
              next_attempt_at = ${nextAttemptAt.toISOString()}::timestamptz,
              last_error = ${lastError.slice(0, 2000)},
              updated_at = now()
          WHERE id = ${id}::uuid`,
    );
  }

  async release(ids: string[], nextAttemptAt: Date): Promise<void> {
    if (ids.length === 0) return;
    await this.query(
      sql`UPDATE public.email_outbox
          SET status = 'pending',
              next_attempt_at = ${nextAttemptAt.toISOString()}::timestamptz,
              updated_at = now()
          WHERE id IN (${sql.join(
            ids.map((id) => sql`${id}::uuid`),
            sql`, `,
          )}) AND status = 'sending'`,
    );
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function mapRow(row: OutboxDbRow): EmailOutboxRecord {
  return {
    id: row.id,
    kind: row.kind as EmailKind,
    idempotencyKey: row.idempotency_key,
    toEmail: row.to_email,
    tenantId: row.tenant_id,
    payload: row.payload ?? {},
    status: row.status as EmailOutboxRecord['status'],
    attempts: row.attempts,
    nextAttemptAt: new Date(row.next_attempt_at),
    lastError: row.last_error,
    providerMessageId: row.provider_message_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    sentAt: row.sent_at ? new Date(row.sent_at) : null,
  };
}
