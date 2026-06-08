import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { GetMeUseCase } from '../application/get-me.use-case';
import { MeResponseDto } from './me.dto';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
@UseGuards(SupabaseJwtGuard)
export class MeController {
  constructor(private readonly getMe: GetMeUseCase) {}

  /** Returns the authenticated user's `sub`, claims and application profile. */
  @Get()
  @ApiOperation({ summary: 'Current user (protected — requires Supabase JWT)' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async me(@CurrentUser() user?: AuthenticatedUser): Promise<MeResponseDto> {
    if (!user) {
      // The guard guarantees a user; this satisfies the type and is defensive.
      throw new UnauthorizedException();
    }
    return this.getMe.execute({ sub: user.sub, claims: user.claims });
  }
}
