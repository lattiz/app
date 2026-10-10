import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../../common/settings/settings.service';
import { EmailOutboxService } from './email-outbox.service';

export interface AdminAlertInput {
  /** Idempotency suffix, e.g. `renewal_failed:<cycleId>`. */
  key: string;
  /** Subject line, Spanish. */
  title: string;
  /** One or two sentences: what happened and what the owner must do. */
  summary: string;
  /** Rendered as a label/value table. */
  details: Record<string, string | number | null>;
  tenantId?: string | null;
}

/** Logs `[ADMIN_ALERT]` and emails the owner once per key. Never throws. */
@Injectable()
export class AdminAlertService {
  private readonly logger = new Logger(AdminAlertService.name);

  constructor(
    private readonly settings: SettingsService,
    private readonly emails: EmailOutboxService,
  ) {}

  async alert(input: AdminAlertInput): Promise<void> {
    const detailText = Object.entries(input.details)
      .map(([label, value]) => `${label}=${value === null ? 'null' : String(value)}`)
      .join(' ');
    this.logger.error(
      `[ADMIN_ALERT] ${input.title} key=${input.key} ${detailText}`.trim(),
    );
    try {
      const to = this.settings.getString('alerts.admin_email').trim();
      if (!to) return;
      await this.emails.enqueue(
        'admin_alert',
        to,
        {
          title: input.title,
          summary: input.summary,
          details: input.details,
        },
        `admin:${input.key}`,
        input.tenantId ?? null,
      );
    } catch (err) {
      this.logger.error(
        `Failed to enqueue admin alert ${input.key}: ${String(err)}`,
      );
    }
  }
}
