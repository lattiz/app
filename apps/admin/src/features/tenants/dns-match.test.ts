import { describe, expect, it } from 'vitest';
import { absentVercelHosts, dnsIssueText, dnsRowIssues, type DnsRow } from './dns-match';

const DOMAIN = 'panaderia.mx';

function row(partial: Partial<DnsRow> & Pick<DnsRow, 'type' | 'name' | 'content'>): DnsRow {
  return { proxied: false, ...partial };
}

describe('dns row issues', () => {
  it('flags a Cloudflare proxy and a record that is not the one Vercel expects', () => {
    expect(
      dnsRowIssues(
        row({ type: 'A', name: DOMAIN, content: '76.76.21.21', proxied: true }),
        DOMAIN,
      ),
    ).toEqual(['proxy']);
    expect(
      dnsRowIssues(row({ type: 'A', name: '@', content: '1.2.3.4' }), DOMAIN),
    ).toEqual(['apex']);
    expect(
      dnsRowIssues(
        row({ type: 'A', name: 'www.panaderia.mx', content: '76.76.21.21' }),
        DOMAIN,
      ),
    ).toEqual(['www']);
    expect(
      dnsRowIssues(
        row({ type: 'CNAME', name: 'www', content: 'cname.vercel-dns.com.' }),
        DOMAIN,
      ),
    ).toEqual([]);
    expect(
      dnsRowIssues(row({ type: 'MX', name: DOMAIN, content: 'mail.example.com' }), DOMAIN),
    ).toEqual([]);
  });

  it('names the mismatch in plain language', () => {
    expect(dnsIssueText(['proxy', 'www'])).toBe(
      'Proxy de Cloudflare activo · Se espera CNAME cname.vercel-dns.com',
    );
  });

  it('notices when the apex or www has no routing record to mark', () => {
    expect(
      absentVercelHosts([row({ type: 'A', name: DOMAIN, content: '1.2.3.4' })], DOMAIN),
    ).toEqual(['www']);
    expect(
      absentVercelHosts(
        [
          row({ type: 'A', name: DOMAIN, content: '76.76.21.21' }),
          row({ type: 'CNAME', name: 'www', content: 'cname.vercel-dns.com' }),
        ],
        DOMAIN,
      ),
    ).toEqual([]);
    expect(absentVercelHosts([row({ type: 'MX', name: DOMAIN, content: 'mail' })], DOMAIN)).toEqual([
      'apex',
      'www',
    ]);
  });
});
