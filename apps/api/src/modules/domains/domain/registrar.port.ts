export type RegistrationStatus = 'active' | 'pending' | 'failed';

export interface DomainAvailability {
  available: boolean;
  /** Registration price in USD cents; null when the domain is not available. */
  priceUsdCents: number | null;
}

export interface RegistrationState {
  status: RegistrationStatus;
  /** Date by which the registrar needs the next renewal; null if it reported none. */
  renewalDate: Date | null;
}

export type RegistrarLifecycleStatus =
  | 'active'
  | 'expired'
  | 'pending'
  | 'unknown';

export interface RegistrarLifecycle {
  status: RegistrarLifecycleStatus;
  /** Date by which the registrar needs the next renewal; null if it reported none. */
  renewalDate: Date | null;
  /** Whether the registrar accepts a plain renewal right now. */
  canRenew: boolean;
  /** Last moment a restore is possible; null when the registrar gave none. */
  restorableUntil: Date | null;
}

export interface RegistrarBalance {
  /** Spendable balance (balance minus reserved) in the account currency, in cents. */
  availableCents: number;
}

/** `default` follows the reseller-account setting, which the API cannot read per domain. */
export type RegistrarAutoRenew = 'on' | 'off' | 'default';

export interface RegisteredDomain extends RegistrationState {
  /** Registrar-side domain id. */
  id: string;
}

export interface RegistrarPort {
  /** True when calls that spend money are faked; availability and prices stay real. */
  readonly isMockMode: boolean;

  checkAvailability(domain: string): Promise<DomainAvailability>;

  /** What Lattiz pays the registrar, in USD cents. */
  getPriceUsdCents(
    domain: string,
    operation: 'create' | 'renew',
  ): Promise<number>;

  /** The domain as registered in Lattiz's registrar account, or null if it is not there. */
  findDomain(domain: string): Promise<RegisteredDomain | null>;

  /** Charges real money (unless in mock mode). The domain is delegated to `nameservers`. */
  registerDomain(params: {
    domain: string;
    periodYears: number;
    nameservers: string[];
  }): Promise<RegisteredDomain>;

  getRegistrationStatus(registrarDomainId: string): Promise<RegistrationState>;

  /** Read-only: Lattiz renews domains itself, so anything other than `off` is a cost leak. */
  getAutoRenew(registrarDomainId: string): Promise<RegistrarAutoRenew>;

  /** Re-delegates an already-registered domain, e.g. when its DNS zone had to be recreated. */
  setNameservers(
    registrarDomainId: string,
    nameservers: string[],
  ): Promise<void>;

  /** Current lifecycle, including whether a plain renewal is accepted. */
  getLifecycle(registrarDomainId: string): Promise<RegistrarLifecycle>;

  /** Charges real money outside mock mode. The response has no new expiry. */
  renewDomain(params: {
    registrarDomainId: string;
    domain: string;
    periodYears: number;
  }): Promise<void>;

  /** Restores an expired domain. May charge; re-read the renewal date after. */
  restoreDomain(params: {
    registrarDomainId: string;
    domain: string;
  }): Promise<void>;

  /** Spendable reseller balance in the account currency. */
  getBalance(): Promise<RegistrarBalance>;
}

export const REGISTRAR_PORT = Symbol('REGISTRAR_PORT');
