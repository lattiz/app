import type { MetadataRoute } from 'next';
import { resolveTenantHostname } from '@/lib/hostname';
import { originFor, parseTenantHost } from '@/lib/tenant-host';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hostname = await resolveTenantHostname();

  // Preview stays crawlable on purpose: a crawler blocked here would never see the
  // X-Robots-Tag: noindex on the page, and could still list the bare URL.
  if (parseTenantHost(hostname)?.kind === 'preview') {
    return { rules: { userAgent: '*', allow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${originFor(hostname)}/sitemap.xml`,
  };
}
