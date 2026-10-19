import { Logger } from '@nestjs/common';
import type { AdminMetricsService } from './admin-metrics.service';
import { KpiSnapshotCron } from './kpi-snapshot.cron';

describe('KpiSnapshotCron', () => {
  it('logs and does not throw when the snapshot fails', async () => {
    const error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const metrics = {
      captureClosedDay: jest.fn(async () => {
        throw new Error('db down');
      }),
    };
    const cron = new KpiSnapshotCron(metrics as unknown as AdminMetricsService);

    await expect(cron.capture()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith('KPI snapshot failed: db down');
  });
});
