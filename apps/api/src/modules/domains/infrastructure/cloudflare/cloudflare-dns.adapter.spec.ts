import { CloudflareDnsAdapter } from './cloudflare-dns.adapter';
import type { CloudflareClient } from './cloudflare.client';

function clientWith(zones: unknown[], records: unknown[] = []) {
  const getAll = jest.fn(async (path: string) => {
    if (path === 'zones') return zones;
    return records;
  });
  return {
    client: { accountId: 'acct', getAll } as unknown as CloudflareClient,
    getAll,
  };
}

describe('CloudflareDnsAdapter.inspectZone', () => {
  it('returns zone status and only apex/www address records', async () => {
    const { client, getAll } = clientWith(
      [
        {
          id: 'z1',
          name: 'cafe.mx',
          status: 'active',
          name_servers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
          original_name_servers: ['ns1.openprovider.nl'],
          activated_on: '2026-01-02T00:00:00.000Z',
          paused: false,
        },
      ],
      [
        {
          id: '1',
          type: 'A',
          name: 'cafe.mx',
          content: '1.2.3.4',
          ttl: 1,
          proxied: false,
        },
        {
          id: '2',
          type: 'MX',
          name: 'cafe.mx',
          content: 'mail.cafe.mx',
          ttl: 1,
        },
        {
          id: '3',
          type: 'AAAA',
          name: 'cafe.mx',
          content: '::1',
          ttl: 1,
        },
        {
          id: '4',
          type: 'CNAME',
          name: 'www.cafe.mx',
          content: 'cname.vercel-dns.com',
          ttl: 1,
          proxied: true,
        },
        {
          id: '5',
          type: 'A',
          name: 'blog.cafe.mx',
          content: '9.9.9.9',
          ttl: 1,
          proxied: false,
        },
      ],
    );

    const zone = await new CloudflareDnsAdapter(client).inspectZone('Cafe.mx');
    expect(zone).toEqual({
      exists: true,
      zoneId: 'z1',
      status: 'active',
      nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
      originalNameservers: ['ns1.openprovider.nl'],
      activatedOn: '2026-01-02T00:00:00.000Z',
      paused: false,
      records: [
        { type: 'A', name: 'cafe.mx', content: '1.2.3.4', proxied: false },
        { type: 'AAAA', name: 'cafe.mx', content: '::1', proxied: null },
        {
          type: 'CNAME',
          name: 'www.cafe.mx',
          content: 'cname.vercel-dns.com',
          proxied: true,
        },
      ],
    });
    expect(getAll).toHaveBeenCalledTimes(3);
  });

  it('reports a missing zone without reading records', async () => {
    const { client, getAll } = clientWith([]);
    const zone = await new CloudflareDnsAdapter(client).inspectZone('cafe.mx');
    expect(zone.exists).toBe(false);
    expect(zone.records).toEqual([]);
    expect(getAll).toHaveBeenCalledTimes(1);
  });
});
