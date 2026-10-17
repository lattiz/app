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
import { AdminAuditInterceptor } from '../audit/admin-audit.interceptor';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminGuard } from '../auth/admin.guard';
import {
  AdminTrialListQueryDto,
  AdminTrialListResponseDto,
  AdminTrialSummaryDto,
} from './admin-trials.dto';
import { AdminTrialsService } from './admin-trials.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/trials')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminTrialsController {
  constructor(private readonly trials: AdminTrialsService) {}

  /** Counts, conversion rates, and the live preview rule. */
  @Get('summary')
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'Summarize free previews' })
  @ApiOkResponse({ type: AdminTrialSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  summary(): Promise<AdminTrialSummaryDto> {
    return this.trials.summary();
  }

  /** Tenants that started a free preview. Viewers stay on aggregate metrics. */
  @Get()
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'List free previews' })
  @ApiOkResponse({ type: AdminTrialListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  list(
    @Query() query: AdminTrialListQueryDto,
  ): Promise<AdminTrialListResponseDto> {
    return this.trials.list(query);
  }
}
