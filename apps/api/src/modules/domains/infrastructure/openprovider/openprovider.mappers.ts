import { RegistrarApiException } from '../../domains.exceptions';
import type { RegistrationStatus } from '../../domain/registrar.port';

export interface OpenproviderPrice {
  price: number;
  currency: string;
}

export function splitDomain(domain: string): {
  name: string;
  extension: string;
} {
  const [name, ...rest] = domain.toLowerCase().split('.');
  return { name, extension: rest.join('.') };
}

/** Lattiz's Openprovider account is billed in USD; anything else is a config change we must not guess at. */
export function toUsdCents(
  price: OpenproviderPrice,
  operation: string,
): number {
  if (price.currency !== 'USD') {
    throw new RegistrarApiException(
      operation,
      `unexpected price currency ${price.currency}, expected USD`,
    );
  }
  return Math.round(price.price * 100);
}

/** Openprovider timestamps are 'YYYY-MM-DD H:MM:SS' (hour may be 1 digit) with no zone; treated as UTC (day-level precision is all we need). */
export function parseOpenproviderDate(
  value: string | null | undefined,
): Date | null {
  const m = value?.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}):(\d{2}))?/,
  );
  if (!m || m[1] === '0000') return null;
  const [year, month, day, hour, minute, second] = m
    .slice(1)
    .map((n) => Number(n ?? 0));
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

/** ACT = active, FAI/DEL = failed, everything else (REQ, PRE, PEN, SCH...) is still in flight. */
export function mapDomainStatus(
  status: string | undefined,
): RegistrationStatus {
  switch (status) {
    case 'ACT':
      return 'active';
    case 'FAI':
    case 'DEL':
      return 'failed';
    default:
      return 'pending';
  }
}
