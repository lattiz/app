import type { EmailKind } from './email-kinds';

export const EMAIL_OUTBOX_REPOSITORY_PORT = Symbol(
  'EMAIL_OUTBOX_REPOSITORY_PORT',
);

export type EmailOutboxStatus = 'pending' | 'sending' | 'sent' | 'failed';

export interface EmailOutboxRecord {
  id: string;
  kind: EmailKind;
  idempotencyKey: string;
  toEmail: string;
  tenantId: string | null;
  payload: Record<string, unknown>;
  status: EmailOutboxStatus;
  attempts: number;
  nextAttemptAt: Date;
  lastError: string | null;
  providerMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
}

export interface InsertOutboxParams {
  kind: EmailKind;
  idempotencyKey: string;
  toEmail: string;
  tenantId: string | null;
  payload: Record<string, unknown>;
}

export interface EmailOutboxRepositoryPort {
  insertIgnore(params: InsertOutboxParams): Promise<boolean>;
  claimDue(limit: number): Promise<EmailOutboxRecord[]>;
  markSent(id: string, providerMessageId: string): Promise<void>;
  markFailed(id: string, lastError: string): Promise<void>;
  markRetry(
    id: string,
    attempts: number,
    nextAttemptAt: Date,
    lastError: string,
  ): Promise<void>;
  /** Returns claimed rows to `pending` untouched (no attempt counted), e.g. after a 429. */
  release(ids: string[], nextAttemptAt: Date): Promise<void>;
}
