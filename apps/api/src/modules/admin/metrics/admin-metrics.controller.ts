import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
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
  MetricsFunnelDto,
  MetricsFunnelQueryDto,
  MetricsHistoryDto,
  MetricsHistoryQueryDto,
  MetricsOverviewDto,
  MetricsRevenueDto,
  MetricsRevenueQueryDto,
  MetricsTemplatesDto,
} from './admin-metrics.dto';
import { AdminMetricsService } from './admin-metrics.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/metrics')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminMetricsController {
  constructor(private readonly metrics: AdminMetricsService) {}

  /** Aggregates only. Stripe failures leave revenue fields null. */
  @Get('overview')
  @AdminRoles('owner', 'operator', 'viewer')
  @ApiOperation({ summary: 'Business overview' })
  @ApiOkResponse({ type: MetricsOverviewDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  overview(): Promise<MetricsOverviewDto> {
    return this.metrics.overview();
  }

  /** Charged revenue by Mexico City month. Stripe failures are 502. */
  @Get('revenue')
  @AdminRoles('owner', 'operator', 'viewer')
  @ApiOperation({ summary: 'Monthly collected revenue' })
  @ApiOkResponse({ type: MetricsRevenueDto })
  @ApiBadGatewayResponse({
    description: 'Stripe did not answer (ADMIN_STRIPE_UNAVAILABLE).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  revenue(@Query() query: MetricsRevenueQueryDto): Promise<MetricsRevenueDto> {
    return this.metrics.revenue(query.months);
  }

  /** Signups in the window and the rates between the following steps. */
  @Get('funnel')
  @AdminRoles('owner', 'operator', 'viewer')
  @ApiOperation({ summary: 'Signup funnel' })
  @ApiOkResponse({ type: MetricsFunnelDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  funnel(@Query() query: MetricsFunnelQueryDto): Promise<MetricsFunnelDto> {
    return this.metrics.funnel(query.days);
  }

  /** Template id, name, tier and counts. No tenant identity. */
  @Get('templates')
  @AdminRoles('owner', 'operator', 'viewer')
  @ApiOperation({ summary: 'Template adoption and conversion' })
  @ApiOkResponse({ type: MetricsTemplatesDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  templates(): Promise<MetricsTemplatesDto> {
    return this.metrics.templates();
  }

  /** Daily KPI rows since the snapshot cron started. */
  @Get('history')
  @AdminRoles('owner', 'operator', 'viewer')
  @ApiOperation({ summary: 'Daily KPI history' })
  @ApiOkResponse({ type: MetricsHistoryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  history(@Query() query: MetricsHistoryQueryDto): Promise<MetricsHistoryDto> {
    return this.metrics.history(query.days);
  }
}
