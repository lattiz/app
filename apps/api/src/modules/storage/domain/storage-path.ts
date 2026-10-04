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
