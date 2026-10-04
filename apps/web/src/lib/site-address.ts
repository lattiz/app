import type { TenantMeResponseDto } from '@lattiz/api-client';

/** Mirrors the tenant-sites redirect rule: only a fully live custom domain replaces the preview address. */
function customDomainIsLive(tenant: TenantMeResponseDto): boolean {
  const domain = tenant.domainStatus;
  return (
    domain != null &&
    domain.dnsStatus === 'active' &&
    domain.sslActive &&
    domain.vercelMapped &&
    !domain.isMock &&
    !domain.suspended
  );
}

/** Where visitors reach the site right now: the custom domain once live, else the free address. */
export function liveSiteUrl(tenant: TenantMeResponseDto): string {
  return customDomainIsLive(tenant) && tenant.domainStatus
    ? `https://${tenant.domainStatus.domain}`
    : tenant.previewUrl;
}

/** `https://panaderia.lattiz.app` -> `panaderia.lattiz.app`. */
export function displayHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
