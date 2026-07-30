import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

// Called by @lattiz/api after a tenant publishes their site.
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

  // { expire: 0 } expires the Data Cache entry immediately so the next request
  // fetches fresh data (publish must be visible now, not on background refresh).
  revalidateTag(`tenant-site:${tenantHostname}`, { expire: 0 });

  return NextResponse.json({
    revalidated: true,
    tenantHostname,
    timestamp: new Date().toISOString(),
  });
}

// Reject other methods explicitly.
export function GET(): NextResponse {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
