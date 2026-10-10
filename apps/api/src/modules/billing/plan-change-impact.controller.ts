import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import {
  PlanChangeImpactQueryDto,
  PlanChangeImpactResponseDto,
} from './dto/plan-change.dto';
import { PlanChangeService } from './plan-change.service';

/** Lives in billing (it needs the Stripe period end) but answers under the tenant. */
@ApiTags('billing')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(SupabaseJwtGuard)
export class PlanChangeImpactController {
  constructor(private readonly planChange: PlanChangeService) {}

  /** What a plan change would take away (e.g. the site's Pro template), shown before confirming. */
  @Get(':tenantId/plan-change-impact')
  @ApiOperation({ summary: 'Preview what a plan change removes (protected)' })
  @ApiOkResponse({ type: PlanChangeImpactResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Tenant does not belong to the caller.',
  })
  async getImpact(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() query: PlanChangeImpactQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PlanChangeImpactResponseDto> {
    if (!user) throw new UnauthorizedException();
    return this.planChange.getImpact(user.sub, tenantId, query.target);
  }
}
