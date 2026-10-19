import {
  Controller,
  Get,
  Query,
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
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminGuard } from '../auth/admin.guard';
import { AdminAuditInterceptor } from './admin-audit.interceptor';
import {
  AdminAuditListResponseDto,
  AdminAuditQueryDto,
} from './admin-audit.dto';
import { AdminAuditLogService } from './admin-audit-log.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/audit')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminAuditController {
  constructor(private readonly audit: AdminAuditLogService) {}

  /** Append-only history, newest first. Owner only. */
  @Get()
  @AdminRoles('owner')
  @ApiOperation({ summary: 'List admin audit events' })
  @ApiOkResponse({ type: AdminAuditListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  list(@Query() query: AdminAuditQueryDto): Promise<AdminAuditListResponseDto> {
    return this.audit.list(query);
  }
}
