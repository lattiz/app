import { Injectable } from '@nestjs/common';
import { SettingsService } from '../../common/settings/settings.service';

export interface RenewalCharge {
  baseCents: number;
  taxCents: number;
  totalCents: number;
}

/**
 * Annual fee for a Lattiz-managed domain. Each read goes through
 * {@link SettingsService} (database, then env, then the code default).
 */
@Injectable()
export class DomainRenewalConfig {
  constructor(private readonly settings: SettingsService) {}

  get enabled(): boolean {
    return this.settings.getBool('domain.renewal.enabled');
  }

  /** Pro uses the pro fee. Every other plan uses the basic fee. */
  feeMxnCents(plan: string): number {
    return this.settings.getInt(
      plan === 'pro'
        ? 'domain.renewal.fee_pro_mxn_cents'
        : 'domain.renewal.fee_basic_mxn_cents',
    );
  }

  get taxRateBps(): number {
    return this.settings.getInt('domain.renewal.tax_rate_bps');
  }

  get openDaysBefore(): number {
    return this.settings.getInt('domain.renewal.open_days_before');
  }

  get noticeDaysBefore(): readonly number[] {
    return this.settings.getIntList('domain.renewal.notice_days_before');
  }

  get lateDays(): number {
    return this.settings.getInt('domain.renewal.late_days');
  }

  get lateNoticeDaysAfter(): readonly number[] {
    return this.settings.getIntList('domain.renewal.late_notice_days_after');
  }

  get maxRegistrarAttempts(): number {
    return this.settings.getInt('domain.renewal.max_registrar_attempts');
  }

  get balanceAlertDays(): number {
    return this.settings.getInt('domain.renewal.balance_alert_days');
  }

  get adminEmail(): string {
    return this.settings.getString('alerts.admin_email');
  }
}

/** IVA rounded to the nearest cent. 59900 at 1600 bps is 9584, total 69484. */
export function computeRenewalCharge(
  baseCents: number,
  taxRateBps: number,
): RenewalCharge {
  const taxCents = Math.round((baseCents * taxRateBps) / 10_000);
  return {
    baseCents,
    taxCents,
    totalCents: baseCents + taxCents,
  };
}
