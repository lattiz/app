import { randomInt } from 'node:crypto';

/** Longest input we bother sending to the database. */
const MAX_INPUT_LENGTH = 100;
// Leaves room for "-NNNN" so a suffixed suggestion still fits in 32 characters.
const MAX_BASE_LENGTH = 26;
const FALLBACK_BASE = 'mi-sitio';

// handle_new_user() makes the 8-hex form; the slug-rules migration backfills odd rows to the 12-hex one.
const TEMPORARY_SLUG = /^tenant-[0-9a-f]{8,12}$/;

/** True once the tenant picked an address instead of keeping the one generated at signup. */
export function isCustomSlug(slug: string): boolean {
  return !TEMPORARY_SLUG.test(slug);
}

/** Trim + lowercase only: accents and other characters are rejected, never silently folded. */
export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Too long to be a slug, or holds a NUL byte, which Postgres text cannot store. */
export function isUnqueryableSlugInput(raw: string): boolean {
  return raw.length > MAX_INPUT_LENGTH || raw.includes('\u0000');
}

/** "Panadería  López!" -> "panaderia-lopez". May be shorter than the minimum; see suggestionCandidates. */
export function slugifyBusinessName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_BASE_LENGTH)
    .replace(/-+$/, '');
}

/** Ordered by preference; the caller keeps the first one that is valid and free. */
export function suggestionCandidates(name: string): string[] {
  const slugified = slugifyBusinessName(name);
  const base =
    slugified.length >= 3
      ? slugified
      : slugified
        ? `${slugified}-sitio`
        : FALLBACK_BASE;

  const numbered = Array.from({ length: 8 }, (_, i) => `${base}-${i + 2}`);
  const random = Array.from(
    { length: 5 },
    () => `${base}-${randomInt(1000, 10000)}`,
  );
  return [base, ...numbered, ...random];
}
