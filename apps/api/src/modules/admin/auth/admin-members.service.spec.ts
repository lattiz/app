import type { Database } from '../../../database/database.module';
import { AdminMembersService } from './admin-members.service';

const USER = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';

describe('AdminMembersService', () => {
  const execute = jest.fn();
  const service = new AdminMembersService({
    execute,
  } as unknown as Database);

  beforeEach(() => {
    service.invalidate(USER);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not query again within 60s and does after the window', async () => {
    jest.useFakeTimers({ now: Date.parse('2026-10-17T00:00:00.000Z') });
    execute.mockResolvedValue([{ role: 'operator', revoked_at: null }]);

    await expect(service.findActiveMember(USER)).resolves.toEqual({
      userId: USER,
      role: 'operator',
    });
    await expect(service.findActiveMember(USER)).resolves.toEqual({
      userId: USER,
      role: 'operator',
    });
    expect(execute).toHaveBeenCalledTimes(1);

    jest.setSystemTime(Date.parse('2026-10-17T00:01:00.000Z'));
    await service.findActiveMember(USER);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('queries again after invalidate', async () => {
    execute.mockResolvedValue([{ role: 'owner', revoked_at: null }]);

    await service.findActiveMember(USER);
    service.invalidate(USER);
    await service.findActiveMember(USER);

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('treats a revoked row as a miss and caches that miss', async () => {
    execute.mockResolvedValue([
      { role: 'owner', revoked_at: '2026-10-01T00:00:00.000Z' },
    ]);

    await expect(service.findActiveMember(USER)).resolves.toBeNull();
    await expect(service.findActiveMember(USER)).resolves.toBeNull();
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
