import { z } from 'zod';

export const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

/** Keeps post-login navigation inside the app and off the auth screens. */
export function safeInternalPath(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith('/\\') || value.includes('\\') || value.includes('://')) {
    return '/';
  }
  const path = value.split(/[?#]/, 1)[0] ?? '/';
  if (path === '/login' || path === '/mfa') return '/';
  return value;
}
