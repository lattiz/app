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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SubscriptionActiveGuard } from '../../common/auth/subscription-active.guard';
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
  UploadedAssetResponseDto,
} from './dto/sites.response.dto';
import { SitesService, type UploadedFile } from './sites.service';

const MAX_ASSET_FILES = 10;
const MAX_ASSET_BYTES = 10 * 1024 * 1024;

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
  @UseGuards(SubscriptionActiveGuard)
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
  @UseGuards(SubscriptionActiveGuard)
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

  /** Uploads editor assets (images) and returns their public Supabase Storage URLs. */
  @Post(':tenantId/assets')
  @UseGuards(SubscriptionActiveGuard)
  @UseInterceptors(
    FilesInterceptor('files', MAX_ASSET_FILES, {
      limits: { fileSize: MAX_ASSET_BYTES, files: MAX_ASSET_FILES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({ summary: 'Upload assets for the tenant site editor (protected)' })
  @ApiOkResponse({ type: UploadedAssetResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
  async uploadAssets(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @UploadedFiles() files: UploadedFile[],
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<UploadedAssetResponseDto[]> {
    return this.sites.uploadAssets(tenantId, requireSub(user), files);
  }

  /** First-time explicit template selection (creates the site schema). */
  @Post('select-template')
  @UseGuards(SubscriptionActiveGuard)
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
  @UseGuards(SubscriptionActiveGuard)
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
