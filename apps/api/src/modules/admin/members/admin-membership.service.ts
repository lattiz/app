import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import {
  AdminMemberConflictException,
  AdminNotFoundException,
} from '../admin.exceptions';
import {
  findAuthUsersByEmail,
  type AuthUserQueryTag,
  type AuthUserRow,
} from '../auth/auth-user-lookup';
import { AdminMembersService } from '../auth/admin-members.service';
import type { AdminRole } from '../auth/admin-roles.decorator';
import type { AdminMemberDto } from './admin-members.dto';

const NOT_REGISTERED = 'El usuario debe registrarse primero en la app.';
const SELF_CHANGE = 'No puedes cambiar tu propio rol ni revocarte.';
const LAST_OWNER = 'Tiene que quedar al menos un owner activo.';
const ALREADY_ACTIVE = 'Ese usuario ya es miembro activo.';
const MEMBER_MISSING = 'No hay un miembro con ese usuario.';

interface MemberState {
  role: string;
  revoked_at: string | Date | null;
}

interface MemberListRow {
  user_id: string;
  email: string | null;
  role: string;
  created_at: string | Date;
  created_by_email: string | null;
  revoked_at: string | Date | null;
  last_sign_in_at: string | Date | null;
}

interface TenantRow {
  id: string;
}

interface RevokeRow {
  revoked_at: string | Date | null;
}

export interface MemberChange {
  userId: string;
  before: unknown;
  after: unknown;
  member: AdminMemberDto;
}

interface SqlExecutor {
  execute(statement: SQL): Promise<unknown>;
}

@Injectable()
export class AdminMembershipService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly cache: AdminMembersService,
  ) {}

  async list(): Promise<AdminMemberDto[]> {
    const rows = await this.query<MemberListRow>(memberListStatement());
    return rows.flatMap((row) => {
      const member = mapMember(row);
      return member ? [member] : [];
    });
  }

  async grant(
    actorId: string,
    email: string,
    role: AdminRole,
  ): Promise<MemberChange> {
    const change = await this.db.transaction(async (tx) => {
      const user = await this.requireUser(tx, email);
      if (user.id === actorId)
        throw new AdminMemberConflictException(SELF_CHANGE);
      const existing = await this.loadMember(user.id, tx);
      if (existing && existing.revoked_at == null) {
        throw new AdminMemberConflictException(ALREADY_ACTIVE);
      }
      const inserted = await this.query<{ user_id: string }>(
        grantStatement(user.id, role, actorId),
        tx,
      );
      if (!inserted[0]) throw new AdminMemberConflictException(ALREADY_ACTIVE);
      await this.markInternal(user.id, actorId, tx);
      const member = await this.loadView(user.id, tx);
      return {
        userId: user.id,
        before: existing
          ? { role: existing.role, revokedAt: toIso(existing.revoked_at) }
          : null,
        after: { role, revokedAt: null },
        member,
      };
    });
    this.cache.invalidate(change.userId);
    return change;
  }

  async updateRole(
    actorId: string,
    userId: string,
    role: AdminRole,
  ): Promise<MemberChange> {
    assertNotSelf(actorId, userId);
    const change = await this.db.transaction(async (tx) => {
      const owners = await this.lockActiveOwners(tx);
      const existing = await this.requireActive(userId, tx);
      this.assertOwnerRemains(existing, role, owners);
      const updated = await this.query<{ role: string }>(
        roleStatement(userId, role),
        tx,
      );
      if (!updated[0]) throw new AdminNotFoundException(MEMBER_MISSING);
      return {
        userId,
        before: { role: existing.role },
        after: { role },
        member: await this.loadView(userId, tx),
      };
    });
    this.cache.invalidate(userId);
    return change;
  }

  async revoke(actorId: string, userId: string): Promise<MemberChange> {
    assertNotSelf(actorId, userId);
    const change = await this.db.transaction(async (tx) => {
      const owners = await this.lockActiveOwners(tx);
      const existing = await this.requireActive(userId, tx);
      this.assertOwnerRemains(existing, null, owners);
      const updated = await this.query<RevokeRow>(revokeStatement(userId), tx);
      const revokedAt = updated[0] ? toIso(updated[0].revoked_at) : null;
      if (!revokedAt) throw new AdminNotFoundException(MEMBER_MISSING);
      return {
        userId,
        before: { role: existing.role, revokedAt: null },
        after: { role: existing.role, revokedAt },
        member: await this.loadView(userId, tx),
      };
    });
    this.cache.invalidate(userId);
    return change;
  }

  private async requireUser(
    executor: SqlExecutor,
    email: string,
  ): Promise<AuthUserRow> {
    const users = await findAuthUsersByEmail(this.tag(executor), email);
    if (users.length === 0) throw new AdminNotFoundException(NOT_REGISTERED);
    if (users.length > 1) {
      throw new AdminMemberConflictException(
        'Hay más de un usuario con ese correo.',
      );
    }
    const user = users[0];
    if (!user) throw new AdminNotFoundException(NOT_REGISTERED);
    return user;
  }

  private async requireActive(
    userId: string,
    executor: SqlExecutor,
  ): Promise<MemberState> {
    const row = await this.loadMember(userId, executor);
    if (!row || row.revoked_at != null) {
      throw new AdminNotFoundException(MEMBER_MISSING);
    }
    return row;
  }

  private async lockActiveOwners(executor: SqlExecutor): Promise<number> {
    const rows = await this.query<{ user_id: string }>(
      ownerLockStatement(),
      executor,
    );
    return rows.length;
  }

  private assertOwnerRemains(
    row: MemberState,
    nextRole: AdminRole | null,
    owners: number,
  ): void {
    if (row.role !== 'owner' || row.revoked_at != null) return;
    if (nextRole === 'owner') return;
    if (owners <= 1) throw new AdminMemberConflictException(LAST_OWNER);
  }

  private async loadMember(
    userId: string,
    executor: SqlExecutor,
  ): Promise<MemberState | undefined> {
    const rows = await this.query<MemberState>(
      memberStateStatement(userId),
      executor,
    );
    return rows[0];
  }

  private async loadView(
    userId: string,
    executor: SqlExecutor,
  ): Promise<AdminMemberDto> {
    const rows = await this.query<MemberListRow>(
      memberListStatement(userId),
      executor,
    );
    const member = rows[0] ? mapMember(rows[0]) : undefined;
    if (!member) throw new AdminNotFoundException(MEMBER_MISSING);
    return member;
  }

  private async markInternal(
    userId: string,
    actorId: string,
    executor: SqlExecutor,
  ): Promise<void> {
    const tenants = await this.query<TenantRow>(
      tenantStatement(userId),
      executor,
    );
    const tenant = tenants[0];
    if (!tenant) return;
    await this.query(internalFlagStatement(tenant.id, actorId), executor);
  }

  private tag(executor: SqlExecutor): AuthUserQueryTag {
    return async (strings, ...values) => {
      const rows = await executor.execute(sql(strings, ...values));
      return rows as unknown as readonly AuthUserRow[];
    };
  }

  private async query<T>(
    statement: SQL,
    executor: SqlExecutor = this.db,
  ): Promise<T[]> {
    const rows = await executor.execute(statement);
    return rows as unknown as T[];
  }
}

function assertNotSelf(actorId: string, userId: string): void {
  if (actorId === userId) throw new AdminMemberConflictException(SELF_CHANGE);
}

function memberStateStatement(userId: string): SQL {
  return sql`
    SELECT role, revoked_at
    FROM admin.members
    WHERE user_id = ${userId}::uuid
    LIMIT 1
    FOR UPDATE
  `;
}

function ownerLockStatement(): SQL {
  return sql`
    SELECT user_id::text AS user_id
    FROM admin.members
    WHERE role = 'owner' AND revoked_at IS NULL
    ORDER BY user_id
    FOR UPDATE
  `;
}

function grantStatement(userId: string, role: AdminRole, actorId: string): SQL {
  return sql`
    INSERT INTO admin.members (user_id, role, created_by, revoked_at)
    VALUES (${userId}::uuid, ${role}, ${actorId}::uuid, NULL)
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        revoked_at = NULL,
        created_by = COALESCE(EXCLUDED.created_by, admin.members.created_by)
    WHERE admin.members.revoked_at IS NOT NULL
    RETURNING user_id::text AS user_id
  `;
}

function roleStatement(userId: string, role: AdminRole): SQL {
  return sql`
    UPDATE admin.members
    SET role = ${role}
    WHERE user_id = ${userId}::uuid
      AND revoked_at IS NULL
    RETURNING role
  `;
}

function revokeStatement(userId: string): SQL {
  return sql`
    UPDATE admin.members
    SET revoked_at = now()
    WHERE user_id = ${userId}::uuid
      AND revoked_at IS NULL
    RETURNING revoked_at
  `;
}

function tenantStatement(userId: string): SQL {
  return sql`
    SELECT id::text AS id
    FROM public.tenants
    WHERE user_id = ${userId}::uuid
  `;
}

function internalFlagStatement(tenantId: string, actorId: string): SQL {
  return sql`
    INSERT INTO admin.tenant_flags (tenant_id, is_internal, updated_by)
    VALUES (${tenantId}::uuid, true, ${actorId}::uuid)
    ON CONFLICT (tenant_id) DO UPDATE
    SET is_internal = true,
        updated_by = COALESCE(EXCLUDED.updated_by, admin.tenant_flags.updated_by)
  `;
}

function memberListStatement(userId?: string): SQL {
  const where = userId ? sql`WHERE m.user_id = ${userId}::uuid` : sql``;
  return sql`
    SELECT
      m.user_id::text AS user_id,
      u.email,
      m.role,
      m.created_at,
      actor.email AS created_by_email,
      m.revoked_at,
      u.last_sign_in_at
    FROM admin.members AS m
    JOIN auth.users AS u ON u.id = m.user_id
    LEFT JOIN auth.users AS actor ON actor.id = m.created_by
    ${where}
    ORDER BY m.created_at DESC, u.email ASC
  `;
}

function mapMember(row: MemberListRow): AdminMemberDto | undefined {
  if (!row.email || !isAdminRole(row.role)) return undefined;
  const createdAt = toIso(row.created_at);
  if (!createdAt) return undefined;
  return {
    userId: row.user_id,
    email: row.email,
    role: row.role,
    createdAt,
    createdBy: row.created_by_email,
    revokedAt: toIso(row.revoked_at),
    lastSignInAt: toIso(row.last_sign_in_at),
  };
}

function isAdminRole(value: string): value is AdminRole {
  return value === 'owner' || value === 'operator' || value === 'viewer';
}

function toIso(value: string | Date | null): string | null {
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
