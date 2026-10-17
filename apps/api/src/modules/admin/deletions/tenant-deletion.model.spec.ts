import { canRetryDeletionJob } from './tenant-deletion.model';

const NOW = new Date('2026-10-17T12:00:00.000Z');

describe('canRetryDeletionJob', () => {
  it('keeps a recent pending job in progress', () => {
    expect(canRetryDeletionJob('pending', NOW, NOW)).toBe(false);
  });

  it('accepts a pending job left unclaimed for three minutes', () => {
    const updatedAt = new Date(NOW.getTime() - 3 * 60 * 1000);
    expect(canRetryDeletionJob('pending', updatedAt, NOW)).toBe(true);
  });
});
