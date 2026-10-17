export const VERCEL_APEX_A = '76.76.21.21';
export const VERCEL_WWW_CNAME = 'cname.vercel-dns.com';

export type DnsRow = {
  type: string;
  name: string;
  content: string;
  proxied: boolean | null;
};

export type DnsRowIssue = 'proxy' | 'apex' | 'www';

/** Why this row disagrees with the records Vercel expects. Empty when it is fine. */
export function dnsRowIssues(record: DnsRow, domain: string): DnsRowIssue[] {
  const issues: DnsRowIssue[] = [];
  if (record.proxied === true) issues.push('proxy');
  const place = dnsPlace(record.name, domain);
  if (place === 'apex' && isRoutingType(record.type) && !isExpectedApex(record)) {
    issues.push('apex');
  }
  if (place === 'www' && isRoutingType(record.type) && !isExpectedWww(record)) {
    issues.push('www');
  }
  return issues;
}

export function dnsIssueText(issues: readonly DnsRowIssue[]): string {
  const labels: string[] = [];
  if (issues.includes('proxy')) labels.push('Proxy de Cloudflare activo');
  if (issues.includes('apex')) labels.push(`Se espera A ${VERCEL_APEX_A}`);
  if (issues.includes('www')) labels.push(`Se espera CNAME ${VERCEL_WWW_CNAME}`);
  return labels.join(' · ');
}

/** Apex or www with no A/AAAA/CNAME at all, so there is no row to mark. */
export function absentVercelHosts(
  records: readonly DnsRow[],
  domain: string,
): Array<'apex' | 'www'> {
  let apex = false;
  let www = false;
  for (const record of records) {
    if (!isRoutingType(record.type)) continue;
    const place = dnsPlace(record.name, domain);
    if (place === 'apex') apex = true;
    if (place === 'www') www = true;
  }
  const missing: Array<'apex' | 'www'> = [];
  if (!apex) missing.push('apex');
  if (!www) missing.push('www');
  return missing;
}

function dnsPlace(name: string, domain: string): 'apex' | 'www' | 'other' {
  const host = normalizeDns(name);
  const apex = normalizeDns(domain);
  if (host === '@' || host === '' || host === apex) return 'apex';
  if (host === 'www' || (apex !== '' && host === `www.${apex}`)) return 'www';
  return 'other';
}

function isExpectedApex(record: DnsRow): boolean {
  return record.type.trim().toUpperCase() === 'A' && normalizeDns(record.content) === VERCEL_APEX_A;
}

function isExpectedWww(record: DnsRow): boolean {
  return (
    record.type.trim().toUpperCase() === 'CNAME' &&
    normalizeDns(record.content) === VERCEL_WWW_CNAME
  );
}

function isRoutingType(type: string): boolean {
  const normalized = type.trim().toUpperCase();
  return normalized === 'A' || normalized === 'AAAA' || normalized === 'CNAME';
}

function normalizeDns(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}
