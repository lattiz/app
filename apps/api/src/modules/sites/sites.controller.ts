import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { PublishSiteDto } from './dto/publish-site.dto';
import { SaveSchemaDto } from './dto/save-schema.dto';
import {
  PublishSiteResponseDto,
  SaveSchemaResponseDto,
  SiteSchemaResponseDto,
} from './dto/sites.response.dto';
import { SitesService } from './sites.service';

@ApiTags('sites')
@ApiBearerAuth()
@Controller('sites')
@UseGuards(SupabaseJwtGuard)
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  /** Returns the editor project JSON for the tenant (seeds from a template on first load). */
  @Get(':tenantId/schema')
  @ApiOperation({ summary: 'Load the tenant site editor project (protected)' })
  @ApiOkResponse({ type: SiteSchemaResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
  async getSchema(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<SiteSchemaResponseDto> {
    return this.sites.getEditorProject(tenantId, requireSub(user));
  }

  /** Persists an autosave of the editor project. */
  @Patch(':tenantId/schema')
  @ApiOperation({ summary: 'Autosave the tenant site editor project (protected)' })
  @ApiOkResponse({ type: SaveSchemaResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
  async saveSchema(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: SaveSchemaDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<SaveSchemaResponseDto> {
    return this.sites.saveEditorProject(tenantId, requireSub(user), dto.project);
  }

  /** Publishes the tenant site (stores exported HTML). */
  @Post(':tenantId/publish')
  @ApiOperation({ summary: 'Publish the tenant site (protected)' })
  @ApiOkResponse({ type: PublishSiteResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
  async publish(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: PublishSiteDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PublishSiteResponseDto> {
    return this.sites.publishSite(
      tenantId,
      requireSub(user),
      dto.project,
      dto.exportedHtml,
    );
  }
}

/** The guard guarantees a user; this narrows the type defensively. */
function requireSub(user?: AuthenticatedUser): string {
  if (!user) throw new UnauthorizedException();
  return user.sub;
}
