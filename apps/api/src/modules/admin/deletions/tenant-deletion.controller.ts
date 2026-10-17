import {
  Body,
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
  ApiAcceptedResponse,
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
import { AdminGuard } from '../auth/admin.guard';
import { AdminRoles } from '../auth/admin-roles.decorator';
import {
  DeletionJobDto,
  DeletionJobListDto,
  DeletionListQueryDto,
  DeletionPreviewDto,
  StartTenantDeletionDto,
  TenantDeletionAcceptedDto,
} from './tenant-deletion.dto';
import { TenantDeletionService } from './tenant-deletion.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/tenants')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminTenantDeletionController {
  constructor(private readonly deletions: TenantDeletionService) {}

  /** What each provider still holds, and which warnings block the delete. */
  @Get(':id/deletion-preview')
  @AdminRoles('owner')
  @ApiOperation({ summary: 'Preview a full tenant deletion' })
  @ApiOkResponse({ type: DeletionPreviewDto })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  preview(@Param('id', ParseUUIDPipe) id: string): Promise<DeletionPreviewDto> {
    return this.deletions.preview(id);
  }

  /** Starts the deletion job and returns before the providers finish. */
  @Post(':id/deletion')
  @HttpCode(HttpStatus.ACCEPTED)
  @AdminRoles('owner')
  @AdminAudit('tenant.delete.start', {
    targetType: 'tenant',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Delete a tenant across every provider' })
  @ApiAcceptedResponse({ type: TenantDeletionAcceptedDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or confirmSlug does not match.',
  })
  @ApiConflictResponse({
    description:
      'The user is an active admin (ADMIN_MEMBER_NOT_DELETABLE) or a deletion is already in progress (TENANT_DELETION_ACTIVE).',
  })
  @ApiNotFoundResponse({ description: 'Unknown tenant (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async start(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: StartTenantDeletionDto,
    @Req() request: Request,
  ): Promise<TenantDeletionAcceptedDto> {
    const actor = actorOf(request);
    const result = await this.deletions.start(id, body, actor);
    request.adminAudit = {
      reason: body.reason,
      after: {
        jobId: result.jobId,
        notifyCustomer: body.notifyCustomer !== false,
      },
    };
    return result;
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/deletions')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminDeletionsController {
  constructor(private readonly deletions: TenantDeletionService) {}

  @Get()
  @AdminRoles('owner')
  @ApiOperation({ summary: 'List tenant deletion jobs' })
  @ApiOkResponse({ type: DeletionJobListDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  list(@Query() query: DeletionListQueryDto): Promise<DeletionJobListDto> {
    return this.deletions.list(query);
  }

  @Get(':jobId')
  @AdminRoles('owner')
  @ApiOperation({ summary: 'Get a tenant deletion job' })
  @ApiOkResponse({ type: DeletionJobDto })
  @ApiNotFoundResponse({ description: 'Unknown job (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  get(@Param('jobId', ParseUUIDPipe) jobId: string): Promise<DeletionJobDto> {
    return this.deletions.get(jobId);
  }

  @Post(':jobId/retry')
  @HttpCode(HttpStatus.ACCEPTED)
  @AdminRoles('owner')
  @AdminAudit('tenant.delete.retry', {
    targetType: 'tenant_deletion',
    targetParam: 'jobId',
  })
  @ApiOperation({ summary: 'Retry a failed or stalled tenant deletion' })
  @ApiAcceptedResponse({ type: TenantDeletionAcceptedDto })
  @ApiConflictResponse({
    description:
      'The job is not failed or stale (TENANT_DELETION_NOT_RETRYABLE).',
  })
  @ApiNotFoundResponse({ description: 'Unknown job (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async retry(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() request: Request,
  ): Promise<TenantDeletionAcceptedDto> {
    const result = await this.deletions.retry(jobId);
    request.adminAudit = { after: { jobId: result.jobId } };
    return result;
  }
}

function actorOf(request: Request): { userId: string; email: string | null } {
  const userId = request.admin?.userId;
  if (!userId) throw new AdminAccessDeniedException();
  return { userId, email: request.admin?.email ?? null };
}
