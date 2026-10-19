import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminAuditInterceptor } from '../audit/admin-audit.interceptor';
import { AdminMeResponseDto } from './admin-me.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminMeController {
  /** Identity and role of the signed-in admin member. */
  @Get('me')
  @AdminRoles('owner', 'operator', 'viewer')
  @ApiOperation({ summary: 'Current admin member' })
  @ApiOkResponse({ type: AdminMeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  me(@Req() request: Request): AdminMeResponseDto {
    const admin = request.admin;
    if (!admin) throw new UnauthorizedException();
    return {
      userId: admin.userId,
      email: admin.email ?? null,
      role: admin.role,
    };
  }
}
