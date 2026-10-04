const DEFAULT_PREVIEW_BASE_DOMAIN = 'lattiz.app';

/** Base domain of `{slug}.<base>` addresses; may carry a port for local dev (`localhost:3002`). */
export function previewBaseDomain(): string {
  return (
    process.env.PREVIEW_BASE_DOMAIN?.trim().toLowerCase() ||
    DEFAULT_PREVIEW_BASE_DOMAIN
  );
}

export function previewHost(slug: string): string {
  return `${slug}.${previewBaseDomain()}`;
}

export function previewUrl(slug: string): string {
  const hostname = previewBaseDomain().split(':')[0];
  // Browsers resolve *.localhost to loopback but there is no certificate for it.
  const isLocal = hostname === 'localhost' || hostname.endsWith('.localhost');
  return `${isLocal ? 'http' : 'https'}://${previewHost(slug)}`;
}

/** True for the base domain itself and anything under it — never a valid custom domain. */
export function isUnderPreviewBase(domain: string): boolean {
  const base = previewBaseDomain().split(':')[0];
  const host = domain.trim().toLowerCase().replace(/\.$/, '');
  return host === base || host.endsWith(`.${base}`);
}
