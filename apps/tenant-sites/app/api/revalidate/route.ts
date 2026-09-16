import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Called by @lattiz/api after a tenant publishes their site. There is no cache
// left to invalidate — getTenantSiteByHostname hits Supabase on every request —
// so this is a no-op kept so the API's publish call keeps getting a 200. The
// auth check stays: an unauthenticated endpoint is a target even when inert.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    console.error('[revalidate] REVALIDATION_SECRET not configured');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 },
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { tenantHostname?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { tenantHostname } = body;
  if (!tenantHostname) {
    return NextResponse.json(
      { error: 'tenantHostname is required' },
      { status: 400 },
    );
  }

  console.log(
    `[revalidate] Received for ${tenantHostname} — no-op (direct DB fetch enabled)`,
  );

  return NextResponse.json({
    received: true,
    tenantHostname,
    timestamp: new Date().toISOString(),
  });
}

// Reject other methods explicitly.
export function GET(): NextResponse {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
