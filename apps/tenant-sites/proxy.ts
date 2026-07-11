import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// DEV NOTE: To test locally, set TENANT_DEV_HOSTNAME in .env.local to match the
// domain stored in tenants.domain for your test tenant (e.g. 'localhost'). In
// production the platform provides the real hostname via the Host header; each
// tenant's domain lives in tenants.domain and DNS points to this deployment.
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Next.js internals never resolve to a tenant — skip resolution.
  if (pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const hostname =
    process.env.NODE_ENV === 'development' && process.env.TENANT_DEV_HOSTNAME
      ? process.env.TENANT_DEV_HOSTNAME
      : (request.headers.get('host') ?? '');

  // Forward on the REQUEST headers so Server Components see it via
  // `await headers()`; response headers would only reach the browser.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-hostname', hostname);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
