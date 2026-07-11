import { headers } from 'next/headers';

/**
 * Resolves the tenant hostname for the current request. `proxy.ts` injects
 * `x-tenant-hostname`; if it's absent (a metadata route the proxy skipped) fall
 * back to the dev override, then the Host header.
 */
export async function resolveTenantHostname(): Promise<string> {
  const headerList = await headers();

  const injected = headerList.get('x-tenant-hostname');
  if (injected) return injected;

  if (
    process.env.NODE_ENV === 'development' &&
    process.env.TENANT_DEV_HOSTNAME
  ) {
    return process.env.TENANT_DEV_HOSTNAME;
  }

  return headerList.get('host') ?? 'localhost:3002';
}
