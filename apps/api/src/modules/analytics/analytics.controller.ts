import {
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SubscriptionActiveGuard } from '../../common/auth/subscription-active.guard';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsOverviewDto,
  AnalyticsRealtimeDto,
} from './dto/analytics.response.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(SupabaseJwtGuard, SubscriptionActiveGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  /** 28-day site overview; provisions GA4 on first visit for Pro tenants. */
  @Get('overview')
  @ApiOperation({ summary: 'Get the tenant analytics overview (protected, Pro)' })
  @ApiOkResponse({ type: AnalyticsOverviewDto })
  async overview(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<AnalyticsOverviewDto> {
    return this.analytics.getOverview(requireSub(user));
  }

  /** Active users in the last 30 minutes. Never provisions; GA failures return 200 with `unavailable`. */
  @Get('realtime')
  @ApiOperation({ summary: 'Get realtime active users (protected, Pro)' })
  @ApiOkResponse({ type: AnalyticsRealtimeDto })
  async realtime(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<AnalyticsRealtimeDto> {
    return this.analytics.getRealtime(requireSub(user));
  }

  /** Re-run a failed GA4 provisioning. 60s cooldown between attempts. */
  @Post('retry')
  @HttpCode(200)
  @ApiOperation({ summary: 'Retry failed analytics provisioning (protected, Pro)' })
  @ApiOkResponse({ type: AnalyticsOverviewDto })
  async retry(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<AnalyticsOverviewDto> {
    return this.analytics.retry(requireSub(user));
  }
}

function requireSub(user?: AuthenticatedUser): string {
  if (!user) throw new UnauthorizedException();
  return user.sub;
}
