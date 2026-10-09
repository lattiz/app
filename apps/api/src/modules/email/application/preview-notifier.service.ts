import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sql, type SQL } from 'drizzle-orm';
import { PreviewConfig } from '../../../common/billing/preview.config';
import { type Database, DATABASE } from '../../../database/database.module';
import { EmailOutboxService } from './email-outbox.service';

/** Same 24h day `computePreviewCapability` uses for `interval '1 day'`. */
const DAY_MS = 86_400_000;

interface PreviewEndingRow {
  id: string;
  name: string | null;
  email: string | null;
  preview_started_at: string | Date;
}

/** One preview-ending email per free tenant; the outbox key blocks repeats. */
@Injectable()
export class PreviewNotifierService {
  private readonly logger = new Logger(PreviewNotifierService.name);
  private running = false;
  private lastStartedAt: number | null = null;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly emails: EmailOutboxService,
    private readonly preview: PreviewConfig,
  ) {}

  // Period lives on PreviewConfig, so the cron tick is fixed and the body waits it out.
  @Cron(CronExpression.EVERY_MINUTE)
  async runScheduled(now: Date = new Date()): Promise<number> {
    if (this.running || !this.isArmed()) return 0;
    const nowMs = now.getTime();
    const intervalMs = this.preview.notifyIntervalMinutes * 60_000;
    if (
      this.lastStartedAt !== null &&
      nowMs - this.lastStartedAt < intervalMs
    ) {
      return 0;
    }
    this.lastStartedAt = nowMs;
    this.running = true;
    try {
      const enqueued = await this.notify(now);
      this.logger.log(`Enqueued ${enqueued} preview_ending email(s)`);
      return enqueued;
    } catch (err) {
      this.logger.error(`Preview ending notify failed: ${String(err)}`);
      return 0;
    } finally {
      this.running = false;
    }
  }

  /** One scan. Callers that already hold the schedule gate use this directly. */
  async notify(now: Date = new Date()): Promise<number> {
    if (!this.isArmed()) return 0;
    const rows = await this.selectDue(now);
    let enqueued = 0;
    for (const row of rows) {
      const email = row.email?.trim() ?? '';
      if (!email || !row.id) continue;
      const started = new Date(row.preview_started_at);
      if (Number.isNaN(started.getTime())) continue;
      const endsAt = new Date(
        started.getTime() + this.preview.trialDays * DAY_MS,
      );
      const inserted = await this.emails.enqueue(
        'preview_ending',
        email,
        {
          endsAt: endsAt.toISOString(),
          siteName: row.name?.trim() || 'tu sitio',
        },
        `preview_ending:${row.id}`,
        row.id,
      );
      if (inserted) enqueued += 1;
    }
    return enqueued;
  }

  private isArmed(): boolean {
    return (
      this.preview.notifyEnabled &&
      this.preview.enabled &&
      this.preview.warningDay > 0
    );
  }

  private async selectDue(now: Date): Promise<PreviewEndingRow[]> {
    // postgres.js rejects a Date bound inside a raw sql`` template; bind ISO text.
    const nowIso = now.toISOString();
    return this.query<PreviewEndingRow>(
      sql`SELECT t.id, t.name, u.email, t.preview_started_at
          FROM public.tenants t
          JOIN auth.users u ON u.id = t.user_id
          WHERE t.plan = 'none'
            AND t.preview_started_at IS NOT NULL
            AND u.email_confirmed_at IS NOT NULL
            AND btrim(u.email) <> ''
            AND ${nowIso}::timestamptz >= t.preview_started_at + make_interval(days => ${this.preview.warningDay})
            AND ${nowIso}::timestamptz < t.preview_started_at + make_interval(days => ${this.preview.trialDays})
            AND NOT EXISTS (
              SELECT 1 FROM public.subscriptions s
              WHERE s.tenant_id = t.id
                AND s.status IN ('active', 'trialing')
                AND s.current_period_end > ${nowIso}::timestamptz
            )
            AND NOT EXISTS (
              SELECT 1 FROM public.email_outbox o
              WHERE o.idempotency_key = 'preview_ending:' || t.id::text
            )
          ORDER BY t.preview_started_at ASC
          LIMIT ${this.preview.notifyBatch}`,
    );
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}
