import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { AdminStorageUsageDto } from '../storage/storage-usage.dto';
import {
  AdminTenantDetailDto,
  AdminTenantListQueryDto,
  AdminTenantListResponseDto,
} from './admin-tenants.dto';
import { AdminTenantsService } from './admin-tenants.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/tenants')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminTenantsController {
  constructor(private readonly tenants: AdminTenantsService) {}

  /** Paginated tenant list for operators. Viewers stay on aggregate metrics. */
  @Get()
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'List tenants' })
  @ApiOkResponse({ type: AdminTenantListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  list(
    @Query() query: AdminTenantListQueryDto,
  ): Promise<AdminTenantListResponseDto> {
    return this.tenants.list(query);
  }

  /** Full tenant record for the 360 view. */
  @Get(':id')
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'Get a tenant' })
  @ApiOkResponse({ type: AdminTenantDetailDto })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<AdminTenantDetailDto> {
    return this.tenants.get(id);
  }

  /** Re-measure R2 usage for one tenant and store the snapshot. */
  @Post(':id/storage/refresh')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner', 'operator')
  @AdminAudit('tenant.storage.refresh', {
    targetType: 'tenant',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Refresh stored object usage for a tenant' })
  @ApiOkResponse({ type: AdminStorageUsageDto })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async refresh(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<AdminStorageUsageDto> {
    const result = await this.tenants.refreshStorage(id);
    request.adminAudit = { before: result.before, after: result.usage };
    return result.usage;
  }
}
