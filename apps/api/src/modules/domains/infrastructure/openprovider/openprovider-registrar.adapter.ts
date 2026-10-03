import { Logger } from '@nestjs/common';
import { RegistrarApiException } from '../../domains.exceptions';
import type {
  DomainAvailability,
  RegisteredDomain,
  RegistrarPort,
  RegistrationState,
} from '../../domain/registrar.port';
import { OpenproviderClient } from './openprovider.client';
import {
  mapDomainStatus,
  parseOpenproviderDate,
  splitDomain,
  toUsdCents,
  type OpenproviderPrice,
} from './openprovider.mappers';

interface CheckResult {
  domain?: string;
  status?: string;
  is_premium?: boolean;
  price?: { reseller?: OpenproviderPrice };
}

interface PriceData {
  is_premium?: boolean;
  price?: { reseller?: OpenproviderPrice };
}

interface DomainData {
  id: number;
  status?: string;
  renewal_date?: string;
}

interface ListedDomain extends DomainData {
  domain: { name: string; extension: string };
  is_deleted?: boolean;
}

const LOOKUP_TIMEOUT_MS = 10_000;
// Realtime registrations can take a while at the registry before the API answers.
const REGISTER_TIMEOUT_MS = 60_000;

export class OpenproviderRegistrarAdapter implements RegistrarPort {
  protected readonly logger = new Logger(OpenproviderRegistrarAdapter.name);

  constructor(
    protected readonly client: OpenproviderClient,
    private readonly customerHandle: string,
  ) {}

  get isMockMode(): boolean {
    return false;
  }

  async checkAvailability(domain: string): Promise<DomainAvailability> {
    const { name, extension } = splitDomain(domain);
    const data = await this.client.post<{ results?: CheckResult[] }>(
      'domains/check',
      {
        operation: 'availability check',
        body: { domains: [{ name, extension }], with_price: true },
        timeoutMs: LOOKUP_TIMEOUT_MS,
      },
    );
    const result = data.results?.find(
      (r) => r.domain?.toLowerCase() === domain.toLowerCase(),
    );
    if (!result) {
      throw new RegistrarApiException(
        'availability check',
        `no result for ${domain}`,
      );
    }

    // Premium names carry a different price/fee flow we do not support.
    const available = result.status === 'free' && !result.is_premium;
    const reseller = result.price?.reseller;
    return {
      available,
      priceUsdCents:
        available && reseller
          ? toUsdCents(reseller, 'availability check')
          : null,
    };
  }

  async getPriceUsdCents(
    domain: string,
    operation: 'create' | 'renew',
  ): Promise<number> {
    const { name, extension } = splitDomain(domain);
    const data = await this.client.get<PriceData>('domains/prices', {
      operation: `${operation} price lookup`,
      // `period` only applies to the create operation.
      query: {
        'domain.name': name,
        'domain.extension': extension,
        operation,
        ...(operation === 'create' ? { period: 1 } : {}),
      },
      timeoutMs: LOOKUP_TIMEOUT_MS,
    });
    const reseller = data.price?.reseller;
    if (!reseller || data.is_premium) {
      throw new RegistrarApiException(
        `${operation} price lookup`,
        data.is_premium
          ? 'premium domains are not supported'
          : `no price for ${domain}`,
      );
    }
    return toUsdCents(reseller, `${operation} price lookup`);
  }

  async findDomain(domain: string): Promise<RegisteredDomain | null> {
    const data = await this.client.get<{ results?: ListedDomain[] }>(
      'domains',
      {
        operation: 'domain lookup',
        query: { full_name: domain, limit: 10 },
        timeoutMs: LOOKUP_TIMEOUT_MS,
      },
    );
    // Compare exactly: the filter semantics (exact vs pattern) are not documented.
    const match = data.results?.find(
      (r) =>
        `${r.domain.name}.${r.domain.extension}`.toLowerCase() ===
          domain.toLowerCase() &&
        !r.is_deleted &&
        r.status !== 'DEL',
    );
    return match ? toRegisteredDomain(match) : null;
  }

  async registerDomain(params: {
    domain: string;
    periodYears: number;
    nameservers: string[];
  }): Promise<RegisteredDomain> {
    if (!this.customerHandle) {
      throw new RegistrarApiException(
        'registration',
        'OPENPROVIDER_CUSTOMER_HANDLE is not configured',
        undefined,
        undefined,
        true,
      );
    }
    if (params.nameservers.length === 0) {
      throw new RegistrarApiException(
        'registration',
        'at least one nameserver is required',
      );
    }
    const { name, extension } = splitDomain(params.domain);
    const data = await this.client.post<DomainData>('domains', {
      operation: 'registration',
      body: {
        domain: { name, extension },
        period: params.periodYears,
        owner_handle: this.customerHandle,
        admin_handle: this.customerHandle,
        tech_handle: this.customerHandle,
        billing_handle: this.customerHandle,
        // Lattiz drives renewals itself; never let the registrar bill on its own.
        autorenew: 'off',
        is_private_whois_enabled: false,
        name_servers: toNameServers(params.nameservers),
      },
      timeoutMs: REGISTER_TIMEOUT_MS,
    });
    return toRegisteredDomain(data);
  }

  async setNameservers(
    registrarDomainId: string,
    nameservers: string[],
  ): Promise<void> {
    if (nameservers.length === 0) {
      throw new RegistrarApiException(
        'nameserver update',
        'at least one nameserver is required',
      );
    }
    await this.client.put(`domains/${encodeURIComponent(registrarDomainId)}`, {
      operation: 'nameserver update',
      body: { name_servers: toNameServers(nameservers) },
      timeoutMs: LOOKUP_TIMEOUT_MS,
    });
  }

  async getRegistrationStatus(
    registrarDomainId: string,
  ): Promise<RegistrationState> {
    const data = await this.client.get<DomainData>(
      `domains/${encodeURIComponent(registrarDomainId)}`,
      { operation: 'registration status', timeoutMs: LOOKUP_TIMEOUT_MS },
    );
    return {
      status: mapDomainStatus(data.status),
      renewalDate: parseOpenproviderDate(data.renewal_date),
    };
  }
}

function toNameServers(
  nameservers: string[],
): Array<{ name: string; seq_nr: number }> {
  return nameservers.map((name, index) => ({ name, seq_nr: index + 1 }));
}

function toRegisteredDomain(data: DomainData): RegisteredDomain {
  return {
    id: String(data.id),
    status: mapDomainStatus(data.status),
    renewalDate: parseOpenproviderDate(data.renewal_date),
  };
}
