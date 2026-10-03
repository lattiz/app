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

export interface RegisteredDomain extends RegistrationState {
  /** Registrar-side domain id. */
  id: string;
}

export interface RegistrarPort {
  /** True when registration/status calls are faked (no money spent); availability and prices stay real. */
  readonly isMockMode: boolean;

  checkAvailability(domain: string): Promise<DomainAvailability>;

  /** What Lattiz pays the registrar, in USD cents. */
  getPriceUsdCents(
    domain: string,
    operation: 'create' | 'renew',
  ): Promise<number>;

  /** The domain as registered in Lattiz's registrar account, or null if it is not there. */
  findDomain(domain: string): Promise<RegisteredDomain | null>;

  /** Charges real money (unless in mock mode). */
  registerDomain(params: {
    domain: string;
    periodYears: number;
  }): Promise<RegisteredDomain>;

  getRegistrationStatus(registrarDomainId: string): Promise<RegistrationState>;
}

export const REGISTRAR_PORT = Symbol('REGISTRAR_PORT');
