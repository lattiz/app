const HOUR_MS = 3_600_000;

export interface FunnelTenant {
  createdAt: string | Date;
  hasSchema: boolean;
  published: boolean;
  paidAt: string | Date | null;
}

export interface FunnelFigures {
  signups: number;
  choseTemplate: number;
  published: number;
  paid: number;
  choseTemplateRate: number | null;
  publishedRate: number | null;
  paidRate: number | null;
  medianHoursToPay: number | null;
}

/** Counts are independent. Rates are each step ÷ the previous one, null if that divisor is 0. */
export function summarizeFunnel(
  tenants: readonly FunnelTenant[],
): FunnelFigures {
  let choseTemplate = 0;
  let published = 0;
  let paid = 0;
  const hours: number[] = [];
  for (const tenant of tenants) {
    if (tenant.hasSchema) choseTemplate += 1;
    if (tenant.published) published += 1;
    const paidAt = timeOf(tenant.paidAt);
    const createdAt = timeOf(tenant.createdAt);
    if (paidAt == null || createdAt == null) continue;
    paid += 1;
    const elapsed = (paidAt - createdAt) / HOUR_MS;
    if (Number.isFinite(elapsed) && elapsed >= 0) hours.push(elapsed);
  }
  return {
    signups: tenants.length,
    choseTemplate,
    published,
    paid,
    choseTemplateRate: rate(choseTemplate, tenants.length),
    publishedRate: rate(published, choseTemplate),
    paidRate: rate(paid, published),
    medianHoursToPay: median(hours),
  };
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.toSorted((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? null;
  const left = sorted[mid - 1];
  const right = sorted[mid];
  if (left === undefined || right === undefined) return null;
  return (left + right) / 2;
}

function timeOf(value: string | Date | null): number | null {
  if (value == null) return null;
  const time =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}
