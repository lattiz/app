import { Logger } from '@nestjs/common';
import type { StorageUsageService } from './storage-usage.service';
import { StorageUsageCron } from './storage-usage.cron';

describe('StorageUsageCron', () => {
  it('measures a capped batch and does not throw when measuring fails', async () => {
    const log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const measureAll = jest
      .fn<Promise<{ measured: number; failed: number }>, [{ batch: number }]>()
      .mockResolvedValueOnce({ measured: 2, failed: 1 })
      .mockRejectedValueOnce(new Error('storage down'));
    const cron = new StorageUsageCron({
      measureAll,
    } as unknown as StorageUsageService);

    await cron.measure();
    expect(measureAll).toHaveBeenCalledWith({ batch: 500 });
    expect(log).toHaveBeenCalledWith('Storage measured=2 failed=1');

    await expect(cron.measure()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      'Storage measurement failed: storage down',
    );
  });
});
