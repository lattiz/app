import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  AdminAccessDeniedException,
  AdminMfaRequiredException,
  AdminRoleForbiddenException,
} from '../admin.exceptions';
import { AdminMembersService } from './admin-members.service';
import { ADMIN_ROLES_KEY, type AdminRole } from './admin-roles.decorator';

const OWNER_ONLY: readonly AdminRole[] = ['owner'];

export interface AdminPrincipal {
  userId: string;
  role: AdminRole;
  email: string | undefined;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminPrincipal;
    }
  }
}

/**
 * Runs after SupabaseJwtGuard. Membership is checked before MFA so a
 * non-member cannot learn that the route requires `aal2`.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly members: AdminMembersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    if (!userId) throw new UnauthorizedException();

    const member = await this.members.findActiveMember(userId);
    if (!member) throw new AdminAccessDeniedException();

    if (request.user?.claims.aal !== 'aal2') {
      throw new AdminMfaRequiredException();
    }

    const allowed =
      this.reflector.getAllAndOverride<readonly AdminRole[] | undefined>(
        ADMIN_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? OWNER_ONLY;
    if (!allowed.includes(member.role)) {
      throw new AdminRoleForbiddenException();
    }

    const emailClaim = request.user?.claims.email;
    request.admin = {
      userId: member.userId,
      role: member.role,
      email: typeof emailClaim === 'string' ? emailClaim : undefined,
    };
    return true;
  }
}
