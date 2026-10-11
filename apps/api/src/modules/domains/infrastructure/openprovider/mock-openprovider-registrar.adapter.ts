import { randomUUID } from 'node:crypto';
import type {
  RegisteredDomain,
  RegistrarAutoRenew,
  RegistrarBalance,
  RegistrarLifecycle,
  RegistrarLifecycleStatus,
  RegistrationState,
} from '../../domain/registrar.port';
import {
  RegistrarApiException,
  RegistrarDomainNotActiveException,
} from '../../domains.exceptions';
import { OpenproviderRegistrarAdapter } from './openprovider-registrar.adapter';

const MOCK_ID_PREFIX = 'mock_';

/** Fixed spendable balance returned while purchases are mocked. */
export const MOCK_REGISTRAR_BALANCE_CENTS = 10_000_000;

/** In-memory lifecycle a test can script before calling renew or restore. */
export interface MockDomainSeed {
  status?: RegistrarLifecycleStatus;
  renewalDate?: Date | null;
  canRenew?: boolean;
  restorableUntil?: Date | null;
  /** When set, renewDomain fails and leaves the stored lifecycle unchanged. */
  failRenewal?: boolean;
}

interface MockLifecycle {
  status: RegistrarLifecycleStatus;
  renewalDate: Date | null;
  canRenew: boolean;
  restorableUntil: Date | null;
  failRenewal: boolean;
}

/** Availability, prices and real-id lookups stay live; spending calls are faked. */
export class MockOpenproviderRegistrarAdapter extends OpenproviderRegistrarAdapter {
  private readonly lifecycles = new Map<string, MockLifecycle>();

  override get isMockMode(): boolean {
    return true;
  }

  /** Test hook: script the in-memory lifecycle of a `mock_` id (expired or failing renew). */
  seedDomain(registrarDomainId: string, seed: MockDomainSeed = {}): void {
    const status = seed.status ?? 'active';
    this.lifecycles.set(registrarDomainId, {
      status,
      renewalDate:
        seed.renewalDate === undefined ? yearsFromNow(1) : seed.renewalDate,
      canRenew: seed.canRenew ?? status !== 'expired',
      restorableUntil: seed.restorableUntil ?? null,
      failRenewal: seed.failRenewal ?? false,
    });
  }

  override registerDomain(params: {
    domain: string;
    periodYears: number;
    nameservers: string[];
  }): Promise<RegisteredDomain> {
    this.logger.warn(
      `[MOCK] Simulating domain registration: ${params.domain} (ns: ${params.nameservers.join(', ')})`,
    );
    const id = `${MOCK_ID_PREFIX}${randomUUID()}`;
    const renewalDate = yearsFromNow(params.periodYears);
    this.lifecycles.set(id, {
      status: 'active',
      renewalDate,
      canRenew: true,
      restorableUntil: null,
      failRenewal: false,
    });
    return Promise.resolve({ id, status: 'active', renewalDate });
  }

  override getRegistrationStatus(
    registrarDomainId: string,
  ): Promise<RegistrationState> {
    if (!registrarDomainId.startsWith(MOCK_ID_PREFIX)) {
      return super.getRegistrationStatus(registrarDomainId);
    }
    return Promise.resolve({ status: 'active', renewalDate: yearsFromNow(1) });
  }

  override getAutoRenew(
    registrarDomainId: string,
  ): Promise<RegistrarAutoRenew> {
    if (!registrarDomainId.startsWith(MOCK_ID_PREFIX)) {
      return super.getAutoRenew(registrarDomainId);
    }
    return Promise.resolve('off');
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

  override getLifecycle(
    registrarDomainId: string,
  ): Promise<RegistrarLifecycle> {
    if (!registrarDomainId.startsWith(MOCK_ID_PREFIX)) {
      return super.getLifecycle(registrarDomainId);
    }
    return Promise.resolve(toLifecycle(this.lifecycleFor(registrarDomainId)));
  }

  override async renewDomain(params: {
    registrarDomainId: string;
    domain: string;
    periodYears: number;
  }): Promise<void> {
    this.logger.warn(
      `[MOCK] Simulating domain renewal: ${params.domain} (${params.periodYears}y)`,
    );
    const state = this.lifecycleFor(params.registrarDomainId);
    if (state.failRenewal) {
      throw new RegistrarApiException('renewal', 'simulated renewal failure');
    }
    if (state.status === 'expired') {
      throw new RegistrarDomainNotActiveException(params.registrarDomainId);
    }
    const previous = state.renewalDate ?? new Date();
    state.renewalDate = addYears(previous, params.periodYears);
    state.status = 'active';
    state.canRenew = true;
    state.restorableUntil = null;
  }

  override async restoreDomain(params: {
    registrarDomainId: string;
    domain: string;
  }): Promise<void> {
    this.logger.warn(`[MOCK] Simulating domain restore: ${params.domain}`);
    const state = this.lifecycleFor(params.registrarDomainId);
    state.status = 'active';
    state.canRenew = true;
    state.restorableUntil = null;
  }

  override getBalance(): Promise<RegistrarBalance> {
    return Promise.resolve({ availableCents: MOCK_REGISTRAR_BALANCE_CENTS });
  }

  private lifecycleFor(registrarDomainId: string): MockLifecycle {
    const existing = this.lifecycles.get(registrarDomainId);
    if (existing) return existing;
    const created: MockLifecycle = {
      status: 'active',
      renewalDate: yearsFromNow(1),
      canRenew: true,
      restorableUntil: null,
      failRenewal: false,
    };
    this.lifecycles.set(registrarDomainId, created);
    return created;
  }
}

function toLifecycle(state: MockLifecycle): RegistrarLifecycle {
  return {
    status: state.status,
    renewalDate: state.renewalDate
      ? new Date(state.renewalDate.getTime())
      : null,
    canRenew: state.canRenew,
    restorableUntil: state.restorableUntil
      ? new Date(state.restorableUntil.getTime())
      : null,
  };
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

function yearsFromNow(years: number): Date {
  return addYears(new Date(), years);
}
