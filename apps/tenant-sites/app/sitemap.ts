import type { MetadataRoute } from 'next';
import { getTenantSiteByHostname } from '@/lib/tenant-data';
import { resolveTenantHostname } from '@/lib/hostname';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostname = await resolveTenantHostname();
  const site = await getTenantSiteByHostname(hostname);

  if (!site) return [];

  const baseUrl = site.domain
    ? `https://${site.domain}`
    : `http://${hostname}`;

  return [
    {
      url: baseUrl,
      lastModified: site.publishedAt ? new Date(site.publishedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
