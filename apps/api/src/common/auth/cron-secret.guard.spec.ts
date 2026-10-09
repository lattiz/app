import { Logger, type ExecutionContext } from '@nestjs/common';
import { CronSecretGuard } from './cron-secret.guard';

function contextWith(authorization?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  } as unknown as ExecutionContext;
}

describe('CronSecretGuard', () => {
  const previous = process.env.CRON_SECRET;
  const guard = new CronSecretGuard();

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.CRON_SECRET = previous;
    jest.restoreAllMocks();
  });

  it('accepts the exact secret as a bearer token', () => {
    process.env.CRON_SECRET = 's3cret-value';
    expect(guard.canActivate(contextWith('Bearer s3cret-value'))).toBe(true);
  });

  it.each([
    undefined,
    'Bearer wrong',
    'Bearer s3cret-valu',
    's3cret-value',
    'Basic s3cret-value',
  ])('rejects %p', (header) => {
    process.env.CRON_SECRET = 's3cret-value';
    expect(() => guard.canActivate(contextWith(header))).toThrow();
  });

  it('rejects everything while CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET;
    expect(() => guard.canActivate(contextWith('Bearer '))).toThrow();
    expect(() => guard.canActivate(contextWith('Bearer anything'))).toThrow();
  });
});
