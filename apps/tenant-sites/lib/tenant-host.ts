const DEFAULT_PREVIEW_BASE_DOMAIN = 'lattiz.app';
// Loose on purpose: only keeps junk labels away from the database, which owns the real slug rules.
const LABEL_SHAPE = /^[a-z0-9-]{1,63}$/;

export type TenantLookup =
  | { kind: 'preview'; slug: string }
  | { kind: 'custom'; domain: string };

/** Lowercased host without a trailing dot; the port, if any, is kept. */
export function normalizeHostname(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.$/, '');
}

function stripPort(host: string): string {
  return host.replace(/:\d+$/, '');
}

/** Hostname (no port) of the free `{slug}.<base>` addresses; PREVIEW_BASE_DOMAIN may carry a port for local dev. */
export function previewBaseDomain(): string {
  const configured = process.env.PREVIEW_BASE_DOMAIN?.trim();
  return stripPort(
    normalizeHostname(configured || DEFAULT_PREVIEW_BASE_DOMAIN),
  );
}

/**
 * `{slug}.<base>` resolves by slug, any other host by custom domain. A host
 * under the base that is not a single clean label (`a.b.<base>`) matches nothing.
 */
export function parseTenantHost(rawHost: string): TenantLookup | null {
  const host = normalizeHostname(rawHost);
  if (!host) return null;

  const suffix = `.${previewBaseDomain()}`;
  const hostname = stripPort(host);
  if (hostname.endsWith(suffix)) {
    const label = hostname.slice(0, -suffix.length);
    return LABEL_SHAPE.test(label) ? { kind: 'preview', slug: label } : null;
  }
  return { kind: 'custom', domain: host };
}

export function isLocalHost(rawHost: string): boolean {
  const hostname = stripPort(normalizeHostname(rawHost));
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1'
  );
}

/** `https://host`, or `http://host` for local development where there is no certificate. */
export function originFor(rawHost: string): string {
  const host = normalizeHostname(rawHost);
  return `${isLocalHost(host) ? 'http' : 'https'}://${host}`;
}

/** True for a domain that is the base domain or sits under it — never a tenant custom domain. */
export function isUnderPreviewBase(domain: string): boolean {
  const host = stripPort(normalizeHostname(domain));
  const base = previewBaseDomain();
  return host === base || host.endsWith(`.${base}`);
}
