import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SettingsService } from '../../../common/settings/settings.service';
import {
  EMAIL_BACKOFF_MS,
  EMAIL_MAX_ATTEMPTS,
  type EmailKind,
} from '../domain/email-kinds';
import {
  EMAIL_OUTBOX_REPOSITORY_PORT,
  type EmailOutboxRecord,
  type EmailOutboxRepositoryPort,
} from '../domain/email-outbox.port';
import {
  EMAIL_PROVIDER_PORT,
  type EmailProviderPort,
} from '../domain/email-provider.port';
import { renderEmail } from '../templates';

// Resend's rate limit is per second; a short pause is enough before the next run picks them up.
const RATE_LIMIT_PAUSE_MS = 60_000;

@Injectable()
export class EmailSenderCron {
  private readonly logger = new Logger(EmailSenderCron.name);
  private running = false;

  constructor(
    @Inject(EMAIL_OUTBOX_REPOSITORY_PORT)
    private readonly outbox: EmailOutboxRepositoryPort,
    @Inject(EMAIL_PROVIDER_PORT)
    private readonly provider: EmailProviderPort,
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    if (!this.settings.getBool('email.sending_enabled')) {
      return;
    }
    if (this.running) return;
    this.running = true;
    try {
      await this.processBatch();
    } catch (err) {
      this.logger.error(`Email sender run failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }

  /** Exposed for offline tests. */
  async processBatch(): Promise<number> {
    const limit = this.settings.getInt('email.max_per_run');

    const from =
      this.config.get<string>('EMAIL_FROM')?.trim() ||
      'Lattiz <no-reply@lattiz.app>';
    const replyTo = this.config.get<string>('EMAIL_REPLY_TO')?.trim();

    const rows = await this.outbox.claimDue(limit);
    if (rows.length === 0) return 0;

    this.logger.log(`Claimed ${rows.length} email(s) to send`);
    let sent = 0;
    for (const [index, row] of rows.entries()) {
      const outcome = await this.sendOne(row, from, replyTo);
      if (outcome === 'sent') sent += 1;
      if (outcome === 'rate_limited') {
        // Every further call would also be rejected; hand the rest back without spending attempts.
        const rest = rows.slice(index + 1).map((r) => r.id);
        await this.outbox.release(
          rest,
          new Date(Date.now() + RATE_LIMIT_PAUSE_MS),
        );
        this.logger.warn(
          `Resend rate limit hit; released ${rest.length} email(s) for later`,
        );
        break;
      }
    }
    return sent;
  }

  private async sendOne(
    row: EmailOutboxRecord,
    from: string,
    replyTo: string | undefined,
  ): Promise<'sent' | 'failed' | 'retry' | 'rate_limited'> {
    let rendered;
    try {
      rendered = renderEmail(row.kind as EmailKind, row.payload);
    } catch (err) {
      await this.outbox.markFailed(
        row.id,
        `render: ${err instanceof Error ? err.message : String(err)}`,
      );
      return 'failed';
    }

    const result = await this.provider.send({
      from,
      to: row.toEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      replyTo,
      idempotencyKey: row.id,
    });

    if (result.ok) {
      await this.outbox.markSent(row.id, result.messageId);
      return 'sent';
    }

    if (!result.retryable) {
      await this.outbox.markFailed(row.id, result.error);
      return 'failed';
    }

    const nextAttempts = row.attempts + 1;
    if (nextAttempts >= EMAIL_MAX_ATTEMPTS) {
      await this.outbox.markFailed(row.id, `max attempts: ${result.error}`);
      return 'failed';
    }

    const delay =
      EMAIL_BACKOFF_MS[
        Math.min(nextAttempts - 1, EMAIL_BACKOFF_MS.length - 1)
      ] ?? EMAIL_BACKOFF_MS[EMAIL_BACKOFF_MS.length - 1];
    const nextAttemptAt = new Date(Date.now() + delay);
    await this.outbox.markRetry(
      row.id,
      nextAttempts,
      nextAttemptAt,
      result.error,
    );
    return result.statusCode === 429 ? 'rate_limited' : 'retry';
  }
}
