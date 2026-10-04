import type { MetadataRoute } from 'next';
import { getTenantSiteByHostname } from '@/lib/tenant-data';
import { resolveTenantHostname } from '@/lib/hostname';
import { originFor } from '@/lib/tenant-host';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostname = await resolveTenantHostname();
  const site = await getTenantSiteByHostname(hostname);

  // The preview address is noindex; listing it would only advertise a duplicate.
  if (!site || site.hostKind === 'preview') return [];

  return [
    {
      url: originFor(hostname),
      lastModified: site.publishedAt ? new Date(site.publishedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
