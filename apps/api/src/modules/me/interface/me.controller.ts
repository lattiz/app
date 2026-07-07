import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { DeleteAccountUseCase } from '../application/delete-account.use-case';
import { GetMeUseCase } from '../application/get-me.use-case';
import { MeResponseDto } from './me.dto';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
@UseGuards(SupabaseJwtGuard)
export class MeController {
  constructor(
    private readonly getMe: GetMeUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

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

  /** Hard-deletes the current account (app profile + Supabase auth user). */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current account (protected — requires Supabase JWT)' })
  @ApiNoContentResponse({ description: 'Account deleted.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async deleteMe(@CurrentUser() user?: AuthenticatedUser): Promise<void> {
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.deleteAccount.execute(user.sub);
  }
}
