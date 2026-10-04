import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getTenantSiteByHostname } from '@/lib/tenant-data';
import { normalizeHostname } from '@/lib/tenant-host';

// Hostname is passed as `?h=` by generateMetadata so this handler never needs
// request headers (Cache Components forbids the edge runtime that OG once used).
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const hostname = normalizeHostname(
      request.nextUrl.searchParams.get('h') ?? '',
    );
    const site = hostname ? await getTenantSiteByHostname(hostname) : null;
    // A preview site may have no custom domain yet, so fall back to the address asked for.
    const tenantDomain = site ? (site.domain ?? hostname) : 'Mi Sitio';

    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '48px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #1447e6, #3b82f6)',
          }}
        />

        {/* Tenant name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '16px',
            letterSpacing: '-1px',
          }}
        >
          {tenantDomain}
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          {site?.tenantName ?? hostname}
        </div>

        {/* Powered by Lattiz */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              background: '#1447e6',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            L
          </div>
          <span style={{ color: '#64748b', fontSize: '18px' }}>
            Desarrollado por Lattiz
          </span>
        </div>
      </div>,
      { width: 1200, height: 630 },
    );
  } catch {
    return new Response('Failed to generate image', { status: 500 });
  }
}
