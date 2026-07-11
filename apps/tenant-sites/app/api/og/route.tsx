import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getTenantSiteByHostname } from '@/lib/tenant-data';

// Hostname is passed as `?h=` by generateMetadata so this handler never needs
// request headers (Cache Components forbids the edge runtime that OG once used).
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const hostname = request.nextUrl.searchParams.get('h') ?? '';
    const site = hostname ? await getTenantSiteByHostname(hostname) : null;
    const tenantName = site?.tenantName ?? 'Mi Sitio';
    const subtitle = site?.domain ?? hostname;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
            padding: '48px',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700, textAlign: 'center' }}>
            {tenantName}
          </div>
          <div style={{ fontSize: 28, marginTop: 24, opacity: 0.7 }}>
            {subtitle}
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch {
    return new Response('Failed to generate image', { status: 500 });
  }
}
