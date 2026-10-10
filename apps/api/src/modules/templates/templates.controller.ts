import { Controller, Get, UseGuards } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { TemplateGalleryItemDto } from './dto/template-list-item.dto';
import { TemplatesService } from './templates.service';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(SupabaseJwtGuard)
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  /** Lists active templates for the gallery, with the caller tenant's access to each (protected). */
  @Get()
  @ApiOperation({
    summary: 'List active templates with plan access (protected)',
  })
  @ApiOkResponse({ type: TemplateGalleryItemDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async findAll(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<TemplateGalleryItemDto[]> {
    if (!user) throw new UnauthorizedException();
    return this.templates.findAllFor(user.sub);
  }
}
