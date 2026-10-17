import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
  AdminDeleteSettingDto,
  AdminSettingsResponseDto,
  AdminSettingViewDto,
  AdminUpdateSettingDto,
} from './admin-settings.dto';
import { AdminSettingsService } from './admin-settings.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/settings')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminSettingsController {
  constructor(private readonly settings: AdminSettingsService) {}

  /** Every registry key with its db, env, and effective value. */
  @Get()
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'List business settings' })
  @ApiOkResponse({ type: AdminSettingsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async list(): Promise<AdminSettingsResponseDto> {
    return { items: await this.settings.list() };
  }

  /** Writes app_settings and reloads this process. Owner only. */
  @Patch(':key')
  @AdminRoles('owner')
  @AdminAudit('settings.update', { targetType: 'setting', targetParam: 'key' })
  @ApiOperation({ summary: 'Update a business setting' })
  @ApiOkResponse({ type: AdminSettingViewDto })
  @ApiBadRequestResponse({
    description: 'Value failed the registry parser (SETTING_VALUE_INVALID).',
  })
  @ApiNotFoundResponse({
    description: 'Key is not in the registry (SETTING_UNKNOWN).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async update(
    @Param('key') key: string,
    @Body() body: AdminUpdateSettingDto,
    @Req() request: Request,
  ): Promise<AdminSettingViewDto> {
    request.adminAudit = { reason: body.reason };
    const result = await this.settings.update(
      key,
      body.value,
      actorEmail(request),
    );
    request.adminAudit = {
      reason: body.reason,
      before: result.before,
      after: result.after,
    };
    return result.entry;
  }

  /** Deletes the row so the key falls back to env or the code default. */
  @Delete(':key')
  @AdminRoles('owner')
  @AdminAudit('settings.delete', { targetType: 'setting', targetParam: 'key' })
  @ApiOperation({ summary: 'Reset a business setting' })
  @ApiOkResponse({ type: AdminSettingViewDto })
  @ApiNotFoundResponse({
    description: 'Key is not in the registry (SETTING_UNKNOWN).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async remove(
    @Param('key') key: string,
    @Body() body: AdminDeleteSettingDto,
    @Req() request: Request,
  ): Promise<AdminSettingViewDto> {
    request.adminAudit = { reason: body.reason };
    const result = await this.settings.remove(key);
    request.adminAudit = {
      reason: body.reason,
      before: result.before,
      after: result.after,
    };
    return result.entry;
  }
}

function actorEmail(request: Request): string {
  const email = request.admin?.email;
  if (!email) throw new UnauthorizedException();
  return email;
}
