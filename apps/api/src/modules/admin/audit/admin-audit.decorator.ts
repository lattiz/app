import { SetMetadata } from '@nestjs/common';

export const ADMIN_AUDIT_KEY = 'adminAudit';

export interface AdminAuditMetadata {
  action: string;
  targetType?: string;
  targetParam?: string;
}

export const AdminAudit = (
  action: string,
  opts?: Pick<AdminAuditMetadata, 'targetType' | 'targetParam'>,
) =>
  SetMetadata(ADMIN_AUDIT_KEY, {
    action,
    ...opts,
  } satisfies AdminAuditMetadata);
