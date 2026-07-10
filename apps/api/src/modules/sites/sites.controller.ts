import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { ChangeTemplateDto } from './dto/change-template.dto';
import { PublishSiteDto } from './dto/publish-site.dto';
import { SaveSchemaDto } from './dto/save-schema.dto';
import { SelectTemplateDto } from './dto/select-template.dto';
import {
  ChangeTemplateResponseDto,
  PublishSiteResponseDto,
  SaveSchemaResponseDto,
  SelectTemplateResponseDto,
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

  /** First-time explicit template selection (creates the site schema). */
  @Post('select-template')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Select a template for the caller tenant (protected)' })
  @ApiOkResponse({ type: SelectTemplateResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'No tenant for this user, or template not found.' })
  @ApiConflictResponse({ description: 'Site schema already exists for this tenant.' })
  async selectTemplate(
    @Body() dto: SelectTemplateDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<SelectTemplateResponseDto> {
    return this.sites.selectTemplate(requireSub(user), dto.templateId);
  }

  /** Switches an existing site to a different template. */
  @Patch(':tenantId/template')
  @ApiOperation({ summary: 'Change the template for the tenant site (protected)' })
  @ApiOkResponse({ type: ChangeTemplateResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
  @ApiNotFoundResponse({ description: 'No site schema found, or template not found.' })
  @ApiConflictResponse({ description: 'Confirmation required to reset existing site content.' })
  async changeTemplate(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: ChangeTemplateDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ChangeTemplateResponseDto> {
    return this.sites.changeTemplate(
      tenantId,
      requireSub(user),
      dto.templateId,
      dto.confirm ?? false,
    );
  }
}

/** The guard guarantees a user; this narrows the type defensively. */
function requireSub(user?: AuthenticatedUser): string {
  if (!user) throw new UnauthorizedException();
  return user.sub;
}
