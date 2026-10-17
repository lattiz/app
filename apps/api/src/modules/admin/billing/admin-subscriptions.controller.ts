import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
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
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { AdminAuditInterceptor } from '../audit/admin-audit.interceptor';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminGuard } from '../auth/admin.guard';
import {
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
}
