import type { ContentObject, ContentValue } from '../types';

/** Keys the compiler fills from business/sections; the copy never has to provide them. */
const DERIVED = new Set(['links', 'branch', 'branches']);

/** Resolves a contentKeys path (`prices[].name`, `stats[].value`, `items[]`) and lists what's missing. */
export function missingPaths(data: ContentObject, key: string): string[] {
  const optional = key.endsWith('?');
  const parts = key.replace(/\?$/, '').split('.');
  if (DERIVED.has(parts[0].replace(/\[\]$/, ''))) return [];
  const out: string[] = [];
  const walk = (value: ContentValue | undefined, i: number, at: string) => {
    if (i === parts.length) {
      const empty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);
      if (empty && !optional) out.push(at);
      return;
    }
    const part = parts[i];
    const list = part.endsWith('[]');
    const name = list ? part.slice(0, -2) : part;
    const next =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as ContentObject)[name]
        : undefined;
    const here = at ? `${at}.${name}` : name;
    if (list) {
      if (!Array.isArray(next) || next.length === 0) {
        if (!optional) out.push(here);
        return;
      }
      if (i === parts.length - 1) return;
      next.forEach((item, n) => walk(item, i + 1, `${here}[${n}]`));
      return;
    }
    walk(next, i + 1, here);
  };
  walk(data, 0, '');
  return out;
}
