import type { Database } from '../../../database/database.module';
import type { DomainsService } from '../../domains/domains.service';
import { AdminNotFoundException } from '../admin.exceptions';
import { AdminDomainController } from './admin-domain.controller';
import { AdminDomainService } from './admin-domain.service';

const TENANT = '11111111-1111-4111-8111-111111111111';
const USER = '33333333-3333-4333-8333-333333333333';
const TTL_MS = 5 * 60 * 1000;

const inspection = {
  domain: { name: 'cafe.mx' },
  renewal: null,
  registrar: null,
  dns: null,
  vercel: null,
};

function setup(userId: string | null = USER) {
  const inspectForTenant = jest.fn().mockResolvedValue(inspection);
  const checkDnsStatus = jest.fn().mockResolvedValue(null);
  const db = {
    execute: jest
      .fn()
      .mockResolvedValue(userId ? [{ user_id: userId }] : []),
  };
  const service = new AdminDomainService(
    db as unknown as Database,
    { inspectForTenant, checkDnsStatus } as unknown as DomainsService,
  );
  return {
    controller: new AdminDomainController(service),
    inspectForTenant,
    checkDnsStatus,
  };
}

describe('AdminDomainController cache', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reuses a result for 5 minutes and skips the cache when refresh=1', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    const { controller, inspectForTenant } = setup();

    await controller.inspect(TENANT, {});
    await controller.inspect(TENANT, {});
    expect(inspectForTenant).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1_000_000 + TTL_MS - 1);
    await controller.inspect(TENANT, {});
    expect(inspectForTenant).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1_000_000 + TTL_MS);
    await controller.inspect(TENANT, {});
    expect(inspectForTenant).toHaveBeenCalledTimes(2);

    await controller.inspect(TENANT, { refresh: '1' });
    expect(inspectForTenant).toHaveBeenCalledTimes(3);
  });

  it('drops the cache after an activation check and returns the new inspection', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    const { controller, inspectForTenant, checkDnsStatus } = setup();
    await controller.inspect(TENANT, {});

    const request = { adminAudit: undefined } as {
      adminAudit?: { after: { domain: string | null } };
    };
    const body = await controller.activationCheck(
      TENANT,
      request as never,
    );
    expect(checkDnsStatus).toHaveBeenCalledWith(USER);
    expect(inspectForTenant).toHaveBeenCalledTimes(2);
    expect(body.domain?.name).toBe('cafe.mx');
    expect(request.adminAudit).toEqual({ after: { domain: 'cafe.mx' } });

    await controller.inspect(TENANT, {});
    expect(inspectForTenant).toHaveBeenCalledTimes(2);
  });

  it('does not inspect an unknown tenant', async () => {
    const { controller, inspectForTenant } = setup(null);
    await expect(controller.inspect(TENANT, {})).rejects.toBeInstanceOf(
      AdminNotFoundException,
    );
    expect(inspectForTenant).not.toHaveBeenCalled();
  });
});
