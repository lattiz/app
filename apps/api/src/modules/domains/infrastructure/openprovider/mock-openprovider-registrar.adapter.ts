import { randomUUID } from 'node:crypto';
import type {
  RegisteredDomain,
  RegistrationState,
} from '../../domain/registrar.port';
import { OpenproviderRegistrarAdapter } from './openprovider-registrar.adapter';

const MOCK_ID_PREFIX = 'mock_';

/** Availability, prices and lookups stay real (read-only); registration and its status are faked. */
export class MockOpenproviderRegistrarAdapter extends OpenproviderRegistrarAdapter {
  override get isMockMode(): boolean {
    return true;
  }

  override registerDomain(params: {
    domain: string;
    periodYears: number;
    nameservers: string[];
  }): Promise<RegisteredDomain> {
    this.logger.warn(
      `[MOCK] Simulating domain registration: ${params.domain} (ns: ${params.nameservers.join(', ')})`,
    );
    return Promise.resolve({
      id: `${MOCK_ID_PREFIX}${randomUUID()}`,
      status: 'active',
      renewalDate: yearsFromNow(params.periodYears),
    });
  }

  override getRegistrationStatus(
    registrarDomainId: string,
  ): Promise<RegistrationState> {
    if (!registrarDomainId.startsWith(MOCK_ID_PREFIX)) {
      return super.getRegistrationStatus(registrarDomainId);
    }
    return Promise.resolve({ status: 'active', renewalDate: yearsFromNow(1) });
  }

  override setNameservers(
    registrarDomainId: string,
    nameservers: string[],
  ): Promise<void> {
    if (!registrarDomainId.startsWith(MOCK_ID_PREFIX)) {
      return super.setNameservers(registrarDomainId, nameservers);
    }
    this.logger.warn(
      `[MOCK] Simulating nameserver update: ${registrarDomainId} (ns: ${nameservers.join(', ')})`,
    );
    return Promise.resolve();
  }
}

function yearsFromNow(years: number): Date {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date;
}
