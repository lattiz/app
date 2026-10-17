import { ObjectStorageException } from './object-storage.exceptions';

/** Where Supabase Storage served the bucket; URLs persisted before the move to R2 contain it. */
export const LEGACY_SUPABASE_MARKER =
  '/storage/v1/object/public/template-assets/';

/** Callers derive paths server-side; this stops a bug from ever escaping the bucket layout. */
export function assertSafePath(operation: string, path: string): void {
  const safe =
    path.length > 0 &&
    path.length <= 512 &&
    !path.startsWith('/') &&
    path.split('/').every((s) => s !== '' && s !== '.' && s !== '..') &&
    // eslint-disable-next-line no-control-regex
    !/[\u0000-\u001f\\?#]/.test(path);
  if (!safe) {
    throw new ObjectStorageException(
      operation,
      'rejected',
      `Invalid object path "${path.slice(0, 80)}".`,
    );
  }
}

/** Editor assets for one tenant. The trailing slash stops a prefix listing from matching a sibling id. */
export function tenantAssetsPrefix(tenantId: string): string {
  return `tenant-assets/${tenantId}/`;
}

/** Logos and favicons for one tenant. Same trailing-slash rule as {@link tenantAssetsPrefix}. */
export function tenantBrandingPrefix(tenantId: string): string {
  return `tenant-branding/${tenantId}/`;
}

/** Same rules as {@link assertSafePath}, but a listing prefix may end with `/`. */
export function assertSafePrefix(operation: string, prefix: string): void {
  const normalized = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
  assertSafePath(operation, normalized);
}

/** Roots `removePrefix` may delete, derived from the prefix helpers so the layout stays in one place. */
function removableTenantRoots(): readonly string[] {
  const id = 't';
  const suffix = `${id}/`;
  return [tenantAssetsPrefix(id), tenantBrandingPrefix(id)].map((prefix) =>
    prefix.slice(0, -suffix.length),
  );
}

/** RFC 9562 UUID versions 1–8, lowercase. The fourth group starts with the RFC variant nibble. */
const TENANT_UUID =
  '[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** One anchored pattern per root: `^<root><uuid>/$`. */
const REMOVABLE_TENANT_PREFIXES: readonly RegExp[] = removableTenantRoots().map(
  (root) => new RegExp(`^${escapeRegex(root)}(${TENANT_UUID})/$`),
);

function refuseRemovablePrefix(prefix: string): never {
  throw new ObjectStorageException(
    'removePrefix',
    'rejected',
    `Refusing to delete prefix "${prefix.slice(0, 80)}".`,
  );
}

/** Throws before any provider call. Only `tenantAssetsPrefix(uuid)` or `tenantBrandingPrefix(uuid)` may be removed. */
export function assertRemovableTenantPrefix(prefix: string): void {
  const normalized = prefix.toLowerCase();
  let id: string | undefined;
  for (const pattern of REMOVABLE_TENANT_PREFIXES) {
    const match = pattern.exec(normalized);
    if (match?.[1]) {
      id = match[1];
      break;
    }
  }
  if (
    id === undefined ||
    (prefix !== tenantAssetsPrefix(id) && prefix !== tenantBrandingPrefix(id))
  ) {
    refuseRemovablePrefix(prefix);
  }
  assertSafePrefix('removePrefix', prefix);
}

export function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

/** Strips `publicBase` (or the legacy Supabase prefix) and any query/hash; null when the URL is not ours. */
export function pathFromPublicUrl(
  url: string | null | undefined,
  publicBase: string | undefined,
): string | null {
  if (!url) return null;

  const base = publicBase ? `${publicBase}/` : undefined;
  let rest: string;
  if (base && url.startsWith(base)) {
    rest = url.slice(base.length);
  } else {
    const index = url.indexOf(LEGACY_SUPABASE_MARKER);
    if (index === -1) return null;
    rest = url.slice(index + LEGACY_SUPABASE_MARKER.length);
  }

  const encoded = rest.split(/[?#]/)[0];
  try {
    const path = decodeURIComponent(encoded);
    return path ? path : null;
  } catch {
    return null;
  }
}
