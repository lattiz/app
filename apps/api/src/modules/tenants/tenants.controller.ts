import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { TenantMeResponseDto } from './dto/tenants.response.dto';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(SupabaseJwtGuard)
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  /** Resolves the authenticated user's tenant. */
  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user tenant (protected)' })
  @ApiOkResponse({ type: TenantMeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'No tenant exists for this user.' })
  async me(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<TenantMeResponseDto> {
    return this.tenants.getMyTenant(requireSub(user));
  }
}

/** The guard guarantees a user; this narrows the type defensively. */
function requireSub(user?: AuthenticatedUser): string {
  if (!user) throw new UnauthorizedException();
  return user.sub;
}
