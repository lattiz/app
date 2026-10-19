import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { AdminAccessDeniedException } from '../admin.exceptions';
import { AdminAudit } from '../audit/admin-audit.decorator';
import { AdminAuditInterceptor } from '../audit/admin-audit.interceptor';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminGuard } from '../auth/admin.guard';
import { AdminStorageUsageDto } from '../storage/storage-usage.dto';
import {
  AdminSuspendTenantDto,
  AdminTenantDetailDto,
  AdminTenantFlagsPatchDto,
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

  /** Hides the public site. Does not change Stripe or the domain. */
  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner', 'operator')
  @AdminAudit('tenant.suspend', { targetType: 'tenant', targetParam: 'id' })
  @ApiOperation({ summary: 'Suspend a tenant site' })
  @ApiOkResponse({ type: AdminTenantDetailDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiConflictResponse({
    description: 'The site is not active (TENANT_STATUS_CONFLICT).',
  })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminSuspendTenantDto,
    @Req() request: Request,
  ): Promise<AdminTenantDetailDto> {
    const result = await this.tenants.suspend(id, dto.reason);
    request.adminAudit = {
      reason: result.reason,
      before: result.before,
      after: result.after,
    };
    return result.detail;
  }

  /** Makes a suspended site public again. Does not change Stripe or the domain. */
  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner', 'operator')
  @AdminAudit('tenant.reactivate', {
    targetType: 'tenant',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Reactivate a suspended tenant site' })
  @ApiOkResponse({ type: AdminTenantDetailDto })
  @ApiConflictResponse({
    description: 'The site is not suspended (TENANT_STATUS_CONFLICT).',
  })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async reactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<AdminTenantDetailDto> {
    const result = await this.tenants.reactivate(id);
    request.adminAudit = { before: result.before, after: result.after };
    return result.detail;
  }

  /** Internal flag drops the tenant from KPIs. Tags and notes are support marks. */
  @Patch(':id/flags')
  @AdminRoles('owner', 'operator')
  @AdminAudit('tenant.flags', { targetType: 'tenant', targetParam: 'id' })
  @ApiOperation({ summary: 'Update internal flags for a tenant' })
  @ApiOkResponse({ type: AdminTenantDetailDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async updateFlags(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminTenantFlagsPatchDto,
    @Req() request: Request,
  ): Promise<AdminTenantDetailDto> {
    const result = await this.tenants.updateFlags(id, dto, actorId(request));
    request.adminAudit = { before: result.before, after: result.after };
    return result.detail;
  }
}

function actorId(request: Request): string {
  const userId = request.admin?.userId;
  if (!userId) throw new AdminAccessDeniedException();
  return userId;
}
