import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { AdminAudit } from '../audit/admin-audit.decorator';
import { AdminAuditInterceptor } from '../audit/admin-audit.interceptor';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminGuard } from '../auth/admin.guard';
import {
  AdminGrantMemberDto,
  AdminMemberDto,
  AdminMemberListResponseDto,
  AdminUpdateMemberDto,
} from './admin-members.dto';
import { AdminMembershipService } from './admin-membership.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/members')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminMembersController {
  constructor(private readonly membership: AdminMembershipService) {}

  /** Active and revoked members, with who granted them and their last sign-in. */
  @Get()
  @AdminRoles('owner')
  @ApiOperation({ summary: 'List admin members' })
  @ApiOkResponse({ type: AdminMemberListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async list(): Promise<AdminMemberListResponseDto> {
    return { items: await this.membership.list() };
  }

  /** The person must already have an account. A revoked member is restored. */
  @Post()
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner')
  @AdminAudit('member.grant', { targetType: 'member' })
  @ApiOperation({ summary: 'Grant admin access' })
  @ApiOkResponse({ type: AdminMemberDto })
  @ApiNotFoundResponse({
    description: 'The email is not registered yet (ADMIN_NOT_FOUND).',
  })
  @ApiConflictResponse({
    description:
      'Already active, ambiguous email, or self-grant (ADMIN_MEMBER_CONFLICT).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async grant(
    @Body() body: AdminGrantMemberDto,
    @Req() request: Request,
  ): Promise<AdminMemberDto> {
    const result = await this.membership.grant(
      actorId(request),
      body.email,
      body.role,
    );
    request.adminAudit = {
      targetId: result.userId,
      before: result.before,
      after: result.after,
    };
    return result.member;
  }

  /** Owner only. Cannot change your own role or remove the last owner. */
  @Patch(':userId')
  @AdminRoles('owner')
  @AdminAudit('member.role', { targetType: 'member', targetParam: 'userId' })
  @ApiOperation({ summary: 'Change an admin member role' })
  @ApiOkResponse({ type: AdminMemberDto })
  @ApiNotFoundResponse({ description: 'Unknown member (ADMIN_NOT_FOUND).' })
  @ApiConflictResponse({
    description: 'Self-change or last owner (ADMIN_MEMBER_CONFLICT).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async updateRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: AdminUpdateMemberDto,
    @Req() request: Request,
  ): Promise<AdminMemberDto> {
    const result = await this.membership.updateRole(
      actorId(request),
      userId,
      body.role,
    );
    request.adminAudit = { before: result.before, after: result.after };
    return result.member;
  }

  /** Sets revoked_at. The row stays so the grant can be restored later. */
  @Delete(':userId')
  @AdminRoles('owner')
  @AdminAudit('member.revoke', { targetType: 'member', targetParam: 'userId' })
  @ApiOperation({ summary: 'Revoke admin access' })
  @ApiOkResponse({ type: AdminMemberDto })
  @ApiNotFoundResponse({ description: 'Unknown member (ADMIN_NOT_FOUND).' })
  @ApiConflictResponse({
    description: 'Self-revoke or last owner (ADMIN_MEMBER_CONFLICT).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async revoke(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ): Promise<AdminMemberDto> {
    const result = await this.membership.revoke(actorId(request), userId);
    request.adminAudit = { before: result.before, after: result.after };
    return result.member;
  }
}

function actorId(request: Request): string {
  const userId = request.admin?.userId;
  if (!userId) throw new UnauthorizedException();
  return userId;
}
