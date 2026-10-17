import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StorageUsageService } from './storage-usage.service';

/** `StorageUsageService` refuses a larger batch, so one night measures the stalest 500. */
const MEASURE_BATCH = 500;

@Injectable()
export class StorageUsageCron {
  private readonly logger = new Logger(StorageUsageCron.name);
  private running = false;

  constructor(private readonly storage: StorageUsageService) {}

  @Cron('30 3 * * *', { timeZone: 'America/Mexico_City' })
  async measure(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.storage.measureAll({ batch: MEASURE_BATCH });
      this.logger.log(
        `Storage measured=${result.measured} failed=${result.failed}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      this.logger.error(`Storage measurement failed: ${message}`);
    } finally {
      this.running = false;
    }
  }
}
