import { randomUUID } from 'node:crypto';
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
  ApiBadGatewayResponse,
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
import {
  AdminCancelSubscriptionDto,
  AdminSubscriptionDetailDto,
  AdminSubscriptionListQueryDto,
  AdminSubscriptionListResponseDto,
} from './admin-subscriptions.dto';
import { AdminSubscriptionsService } from './admin-subscriptions.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/subscriptions')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminSubscriptionsController {
  constructor(private readonly subscriptions: AdminSubscriptionsService) {}

  /** Paginated subscriptions. Viewers stay on aggregate metrics. */
  @Get()
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'List subscriptions' })
  @ApiOkResponse({ type: AdminSubscriptionListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  list(
    @Query() query: AdminSubscriptionListQueryDto,
  ): Promise<AdminSubscriptionListResponseDto> {
    return this.subscriptions.list(query);
  }

  /** Local row plus a cached Stripe snapshot. Stripe errors do not fail the request. */
  @Get(':id')
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'Get a subscription' })
  @ApiOkResponse({ type: AdminSubscriptionDetailDto })
  @ApiNotFoundResponse({
    description: 'Unknown subscription (ADMIN_NOT_FOUND).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  get(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminSubscriptionDetailDto> {
    return this.subscriptions.get(id);
  }

  /** Schedules the end of the period, or cancels immediately without proration. */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner')
  @AdminAudit('subscription.cancel', {
    targetType: 'subscription',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Cancel a subscription in Stripe' })
  @ApiOkResponse({ type: AdminSubscriptionDetailDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiConflictResponse({
    description:
      'Already ended (SUBSCRIPTION_NOT_CANCELABLE) or an active schedule (SUBSCRIPTION_SCHEDULE_ACTIVE).',
  })
  @ApiBadGatewayResponse({
    description: 'Stripe did not respond (ADMIN_STRIPE_UNAVAILABLE).',
  })
  @ApiNotFoundResponse({
    description: 'Unknown subscription (ADMIN_NOT_FOUND).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminCancelSubscriptionDto,
    @Req() request: Request,
  ): Promise<AdminSubscriptionDetailDto> {
    const result = await this.subscriptions.cancel(id, {
      mode: dto.mode,
      reason: dto.reason,
      actorUserId: actorId(request),
      auditRequestId: auditRequestId(request),
    });
    request.adminAudit = {
      reason: dto.reason,
      before: result.before,
      after: result.after,
    };
    return result.detail;
  }

  /** Clears a scheduled cancellation. Does not start a new billing period. */
  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner')
  @AdminAudit('subscription.resume', {
    targetType: 'subscription',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Undo a scheduled subscription cancellation' })
  @ApiOkResponse({ type: AdminSubscriptionDetailDto })
  @ApiConflictResponse({
    description: 'Nothing scheduled to undo (SUBSCRIPTION_NOT_RESUMABLE).',
  })
  @ApiBadGatewayResponse({
    description: 'Stripe did not respond (ADMIN_STRIPE_UNAVAILABLE).',
  })
  @ApiNotFoundResponse({
    description: 'Unknown subscription (ADMIN_NOT_FOUND).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async resume(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<AdminSubscriptionDetailDto> {
    const result = await this.subscriptions.resume(id, auditRequestId(request));
    request.adminAudit = { before: result.before, after: result.after };
    return result.detail;
  }
}

function actorId(request: Request): string {
  const userId = request.admin?.userId;
  if (!userId) throw new AdminAccessDeniedException();
  return userId;
}

function auditRequestId(request: Request): string {
  const raw = request.headers['x-request-id'];
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (typeof header === 'string' && /^[A-Za-z0-9._:-]{1,80}$/.test(header)) {
    return header;
  }
  return randomUUID();
}
