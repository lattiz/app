import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import type { EmailKind } from '../domain/email-kinds';
import {
  EMAIL_OUTBOX_REPOSITORY_PORT,
  type EmailOutboxRepositoryPort,
} from '../domain/email-outbox.port';

/**
 * Public enqueue API. Never throws into callers — failures are logged only.
 * Does not import BillingModule or DomainsModule.
 */
@Injectable()
export class EmailOutboxService {
  private readonly logger = new Logger(EmailOutboxService.name);

  constructor(
    @Inject(EMAIL_OUTBOX_REPOSITORY_PORT)
    private readonly outbox: EmailOutboxRepositoryPort,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  async enqueue(
    kind: EmailKind,
    to: string,
    data: Record<string, unknown>,
    idempotencyKey: string,
    tenantId: string | null = null,
  ): Promise<boolean> {
    try {
      const inserted = await this.outbox.insertIgnore({
        kind,
        idempotencyKey,
        toEmail: to,
        tenantId,
        payload: data,
      });
      if (inserted) {
        this.logger.log(`Enqueued ${kind} → ${to} (key=${idempotencyKey})`);
        return true;
      }
      this.logger.debug(
        `Skipped duplicate enqueue ${kind} (key=${idempotencyKey})`,
      );
      return false;
    } catch (err) {
      this.logger.error(
        `Failed to enqueue ${kind} (key=${idempotencyKey}): ${String(err)}`,
      );
      return false;
    }
  }

  /** Resolve auth.users.email via tenants.user_id; skip + log when missing. */
  async enqueueForTenant(
    kind: EmailKind,
    tenantId: string,
    data: Record<string, unknown>,
    idempotencyKey: string,
  ): Promise<void> {
    try {
      const email = await this.resolveEmailForTenant(tenantId);
      if (!email) {
        this.logger.warn(
          `No recipient email for tenant ${tenantId}; skipped ${kind}`,
        );
        return;
      }
      await this.enqueue(kind, email, data, idempotencyKey, tenantId);
    } catch (err) {
      this.logger.error(
        `Failed enqueueForTenant ${kind} (tenant=${tenantId}): ${String(err)}`,
      );
    }
  }

  async resolveEmailForTenant(tenantId: string): Promise<string | null> {
    const rows = await this.query<{ email: string | null }>(
      sql`SELECT u.email
          FROM public.tenants t
          JOIN auth.users u ON u.id = t.user_id
          WHERE t.id = ${tenantId}::uuid
          LIMIT 1`,
    );
    const email = rows[0]?.email?.trim();
    return email ? email : null;
  }

  async resolveEmailForUser(userId: string): Promise<string | null> {
    const rows = await this.query<{ email: string | null }>(
      sql`SELECT email FROM auth.users WHERE id = ${userId}::uuid LIMIT 1`,
    );
    const email = rows[0]?.email?.trim();
    return email ? email : null;
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}
