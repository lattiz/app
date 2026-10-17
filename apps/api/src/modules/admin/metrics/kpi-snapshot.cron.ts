import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AdminMetricsService } from './admin-metrics.service';

@Injectable()
export class KpiSnapshotCron {
  private readonly logger = new Logger(KpiSnapshotCron.name);
  private running = false;

  constructor(private readonly metrics: AdminMetricsService) {}

  /** Upserts the previous Mexico City day: each row is a closed day, taken just after midnight. */
  @Cron('15 0 * * *', { timeZone: 'America/Mexico_City' })
  async capture(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.metrics.captureClosedDay();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      this.logger.error(`KPI snapshot failed: ${message}`);
    } finally {
      this.running = false;
    }
  }
}
