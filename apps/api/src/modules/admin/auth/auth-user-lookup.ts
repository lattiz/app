export interface AuthUserRow {
  id: string;
  email: string;
}

/** Tagged-template query. postgres.js and a Drizzle wrapper both satisfy it. */
export type AuthUserQueryTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<readonly AuthUserRow[]>;

/**
 * Users with this email, compared case-insensitively.
 * Shared by `admin:grant` and the members API so the lookup stays in one place.
 */
export async function findAuthUsersByEmail(
  query: AuthUserQueryTag,
  email: string,
): Promise<AuthUserRow[]> {
  const rows = await query`
    SELECT id::text AS id, email
    FROM auth.users
    WHERE email IS NOT NULL AND lower(email) = lower(${email})
  `;
  return rows.filter(isAuthUserRow);
}

function isAuthUserRow(value: unknown): value is AuthUserRow {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as { id?: unknown; email?: unknown };
  return typeof row.id === 'string' && typeof row.email === 'string';
}
