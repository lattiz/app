import { SetMetadata } from '@nestjs/common';

export type AdminRole = 'owner' | 'operator' | 'viewer';

export const ADMIN_ROLES_KEY = 'adminRoles';

/** Allow-list. A route without this decorator is owner-only (fail closed). */
export const AdminRoles = (...roles: AdminRole[]) =>
  SetMetadata(ADMIN_ROLES_KEY, roles);
