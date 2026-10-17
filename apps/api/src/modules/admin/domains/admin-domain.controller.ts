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
import {
  AdminDomainInspectionDto,
  AdminDomainQueryDto,
} from './admin-domain.dto';
import { AdminDomainService } from './admin-domain.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/tenants')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminDomainController {
  constructor(private readonly domain: AdminDomainService) {}

  /** Live registrar, DNS and Vercel picture for the tenant's domain. Cached for 5 minutes. */
  @Get(':id/domain')
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'Inspect a tenant domain' })
  @ApiOkResponse({ type: AdminDomainInspectionDto })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  inspect(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AdminDomainQueryDto,
  ): Promise<AdminDomainInspectionDto> {
    return this.domain.inspect(id, query.refresh === '1');
  }

  /** Asks the DNS provider to re-check delegation, then returns a fresh inspection. */
  @Post(':id/domain/activation-check')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner', 'operator')
  @AdminAudit('tenant.domain.activation_check', {
    targetType: 'tenant',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Re-check DNS activation for a tenant domain' })
  @ApiOkResponse({ type: AdminDomainInspectionDto })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async activationCheck(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<AdminDomainInspectionDto> {
    const result = await this.domain.activationCheck(id);
    request.adminAudit = { after: { domain: result.domain?.name ?? null } };
    return result;
  }
}
