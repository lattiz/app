import { computeRenewalCharge } from './domain-renewal.config';
import { RENEWAL_DAY_MS, renewalWindow } from './domain/domain-renewal.policy';
import type {
  DnsProviderName,
  DnsZoneInspectionRecord,
} from './domain/dns-provider.port';
import type {
  RegistrarAutoRenew,
  RegistrarLifecycleStatus,
} from './domain/registrar.port';
import type {
  DnsStatus,
  DomainRenewalStatusDto,
  DomainSourceValue,
} from './dto/domains.response.dto';

/** Each live provider call in an admin inspection gives up after this. */
export const DOMAIN_INSPECT_TIMEOUT_MS = 8_000;

const MEXICO_CITY = 'America/Mexico_City';
const DAY_MS = RENEWAL_DAY_MS;
/** The included-domain stamp is written in the statement right after purchase_completed_at. */
const INCLUDED_STAMP_TOLERANCE_MS = 60_000;
const LAST_ERROR_MAX = 240;

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: MEXICO_CITY,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export interface DomainInspectionRecord {
  name: string;
  source: DomainSourceValue;
  expiresAt: string | null;
  dnsStatus: DnsStatus;
  dnsProvider: DnsProviderName | null;
  dnsActivationCheckedAt: string | null;
  vercelMapped: boolean;
  sslActive: boolean;
  suspendedAt: string | null;
  isMock: boolean;
  purchaseCompletedAt: string | null;
}

export interface DomainInspectionCycle {
  status: string;
  amountCents: number | null;
  currency: string;
  openedAt: string | null;
  paidAt: string | null;
  renewedAt: string | null;
  overdueAt: string | null;
  lapsedAt: string | null;
  lastError: string | null;
}

export interface ManagedRenewalInspection {
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  paymentOpensAt: string | null;
  daysUntilPaymentOpens: number | null;
  noticeDates: string[];
  lateDeadlineAt: string | null;
  currentCycle: DomainRenewalStatusDto | null;
  cycles: DomainInspectionCycle[];
  expectedChargeCents: number;
  currency: string;
  firstYearIncluded: boolean;
}

export interface CustomerRenewalInspection {
  managedBy: 'customer';
}

export interface RegistrarInspection {
  status: RegistrarLifecycleStatus;
  renewalDate: string | null;
  canRenew: boolean;
  restorableUntil: string | null;
  autoRenew: RegistrarAutoRenew;
  expiryMismatch: boolean;
}

export interface ProviderError {
  error: 'unavailable';
}

export interface DnsInspection {
  exists: boolean;
  zoneId: string | null;
  status: string | null;
  nameservers: string[];
  originalNameservers: string[];
  activatedOn: string | null;
  paused: boolean | null;
  records: DnsZoneInspectionRecord[];
  recordsMatchVercel: boolean;
}

export interface VercelInspection {
  inProject: boolean;
  configured: boolean;
}

export interface DomainInspection {
  domain: DomainInspectionRecord | null;
  renewal: ManagedRenewalInspection | CustomerRenewalInspection | null;
  registrar: RegistrarInspection | ProviderError | null;
  dns: DnsInspection | ProviderError | null;
  vercel: VercelInspection | ProviderError | null;
}

export function emptyInspection(): DomainInspection {
  return {
    domain: null,
    renewal: null,
    registrar: null,
    dns: null,
    vercel: null,
  };
}

/** Signed Mexico City calendar-day distance from `now` to `target`. */
export function mexicoCityCalendarDays(now: Date, target: Date): number {
  const from = startOfMexicoCityDay(now).getTime();
  const to = startOfMexicoCityDay(target).getTime();
  return Math.round((to - from) / DAY_MS);
}

export function recordsMatchVercel(
  domain: string,
  records: DnsZoneInspectionRecord[],
  targets: { ipv4: string; cname: string },
): boolean {
  const apex = records.filter((record) => isApexName(record.name, domain));
  const www = records.filter((record) => isWwwName(record.name, domain));
  return (
    apex.length === 1 &&
    apex[0].type === 'A' &&
    apex[0].proxied !== true &&
    sameContent(apex[0].content, targets.ipv4) &&
    www.length === 1 &&
    www[0].type === 'CNAME' &&
    www[0].proxied !== true &&
    sameContent(www[0].content, targets.cname)
  );
}

/** True when both instants exist and are more than one day apart. */
export function expiryMismatch(
  renewalDate: Date | null,
  expiresAt: Date | null,
): boolean {
  if (!renewalDate || !expiresAt) return false;
  return Math.abs(renewalDate.getTime() - expiresAt.getTime()) > RENEWAL_DAY_MS;
}

export function buildManagedRenewal(input: {
  expiresAt: Date | null;
  now: Date;
  openDaysBefore: number;
  noticeDaysBefore: readonly number[];
  lateDays: number;
  feeMxnCents: number;
  taxRateBps: number;
  currentCycle: DomainRenewalStatusDto | null;
  cycles: DomainInspectionCycle[];
  firstYearIncluded: boolean;
}): ManagedRenewalInspection {
  const charge = computeRenewalCharge(input.feeMxnCents, input.taxRateBps);
  if (!input.expiresAt) {
    return {
      expiresAt: null,
      daysUntilExpiry: null,
      paymentOpensAt: null,
      daysUntilPaymentOpens: null,
      noticeDates: [],
      lateDeadlineAt: null,
      currentCycle: input.currentCycle,
      cycles: input.cycles,
      expectedChargeCents: charge.totalCents,
      currency: 'mxn',
      firstYearIncluded: input.firstYearIncluded,
    };
  }

  const window = renewalWindow({
    expiresAt: input.expiresAt,
    now: input.now,
    openDaysBefore: input.openDaysBefore,
    lateDays: input.lateDays,
  });
  const expiresAt = input.expiresAt.getTime();
  return {
    expiresAt: input.expiresAt.toISOString(),
    daysUntilExpiry: mexicoCityCalendarDays(input.now, input.expiresAt),
    paymentOpensAt: window.opensAt.toISOString(),
    daysUntilPaymentOpens: mexicoCityCalendarDays(input.now, window.opensAt),
    noticeDates: input.noticeDaysBefore.map((days) =>
      new Date(expiresAt - days * RENEWAL_DAY_MS).toISOString(),
    ),
    lateDeadlineAt: window.lateDeadlineAt.toISOString(),
    currentCycle: input.currentCycle,
    cycles: input.cycles,
    expectedChargeCents: charge.totalCents,
    currency: 'mxn',
    firstYearIncluded: input.firstYearIncluded,
  };
}

export function firstYearIncluded(input: {
  isMock: boolean;
  purchaseCompletedAt: Date | null;
  includedDomainUsedAt: Date | null;
}): boolean {
  if (input.isMock || !input.purchaseCompletedAt || !input.includedDomainUsedAt) {
    return false;
  }
  return (
    Math.abs(
      input.purchaseCompletedAt.getTime() - input.includedDomainUsedAt.getTime(),
    ) <= INCLUDED_STAMP_TOLERANCE_MS
  );
}

export function trimLastError(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > LAST_ERROR_MAX
    ? trimmed.slice(0, LAST_ERROR_MAX)
    : trimmed;
}

export function asDate(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function cents(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function startOfMexicoCityDay(instant: Date): Date {
  const [year, month, day] = dayFormat.format(instant).split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offset = zoneOffsetMs(new Date(utcMidnight));
  const start = new Date(utcMidnight - offset);
  const checked = zoneOffsetMs(start);
  if (checked !== offset) return new Date(utcMidnight - checked);
  return start;
}

function zoneOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MEXICO_CITY,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  let hour = read('hour');
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    hour,
    read('minute'),
    read('second'),
  );
  return asUtc - instant.getTime();
}

function isApexName(name: string, domain: string): boolean {
  const label = normalizeName(name);
  const host = normalizeName(domain);
  return label === '@' || label === host;
}

function isWwwName(name: string, domain: string): boolean {
  const label = normalizeName(name);
  const host = normalizeName(domain);
  return label === 'www' || label === `www.${host}`;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

function sameContent(actual: string, expected: string): boolean {
  return normalizeName(actual) === normalizeName(expected);
}
