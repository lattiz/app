import type { MetadataRoute } from 'next';
import { resolveTenantHostname } from '@/lib/hostname';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hostname = await resolveTenantHostname();
  const baseUrl = /^localhost(:\d+)?$/.test(hostname)
    ? `http://${hostname}`
    : `https://${hostname}`;

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
