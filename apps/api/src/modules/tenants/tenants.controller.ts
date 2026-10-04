import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SubscriptionActiveGuard } from '../../common/auth/subscription-active.guard';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { SensitiveActionRateLimit } from '../../common/throttling/rate-limits';
import {
  BrandingUploadResponseDto,
  TenantBrandingDto,
} from './dto/branding.response.dto';
import {
  SlugAvailabilityResponseDto,
  TenantSlugResponseDto,
} from './dto/slug.response.dto';
import { TenantMeResponseDto } from './dto/tenants.response.dto';
import { SlugAvailabilityQueryDto, UpdateSlugDto } from './dto/update-slug.dto';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import {
  BRANDING_TYPES,
  type BrandingType,
  UploadBrandingDto,
} from './dto/upload-branding.dto';
import { TenantSlugService } from './tenant-slug.service';
import { TenantsService, type UploadedBrandingFile } from './tenants.service';

// Ceiling for the multipart parser — the per-slot limit (1MB favicon, 4MB
// social preview) is enforced in the service, which knows the slot.
const MAX_BRANDING_BYTES = 4 * 1024 * 1024;

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(SupabaseJwtGuard)
export class TenantsController {
  constructor(
    private readonly tenants: TenantsService,
    private readonly slugs: TenantSlugService,
  ) {}

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

  /** Claims the `{slug}.lattiz.app` address; the unique index settles concurrent claims. */
  @Patch('me/slug')
  @SensitiveActionRateLimit()
  // The namespace is shared and finite: only a live subscription may reserve a name.
  @UseGuards(SubscriptionActiveGuard)
  @ApiOperation({ summary: 'Change the tenant site address (protected)' })
  @ApiOkResponse({ type: TenantSlugResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'SLUG_INVALID or SLUG_RESERVED.' })
  @ApiConflictResponse({ description: 'SLUG_TAKEN.' })
  async updateSlug(
    @Body() dto: UpdateSlugDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<TenantSlugResponseDto> {
    return this.slugs.claimSlug(requireSub(user), dto.slug);
  }

  /** Live check behind the address field; same rules as the claim, nothing is written. */
  @Get('me/slug/availability')
  @ApiOperation({
    summary: 'Check whether a site address can be claimed (protected)',
  })
  @ApiOkResponse({ type: SlugAvailabilityResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async slugAvailability(
    @Query() query: SlugAvailabilityQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<SlugAvailabilityResponseDto> {
    return this.slugs.checkAvailability(requireSub(user), query.slug);
  }

  /** A free address derived from the business name. */
  @Get('me/slug/suggestion')
  @ApiOperation({ summary: 'Suggest an available site address (protected)' })
  @ApiOkResponse({ type: TenantSlugResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiConflictResponse({
    description: 'SLUG_TAKEN: no free candidate was found.',
  })
  async slugSuggestion(
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<TenantSlugResponseDto> {
    return this.slugs.suggestSlug(requireSub(user));
  }

  /** Uploads a favicon or social-preview image for the tenant site. */
  @Post(':tenantId/branding')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_BRANDING_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['type', 'file'],
      properties: {
        type: { type: 'string', enum: [...BRANDING_TYPES] },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a tenant branding image (protected)' })
  @ApiOkResponse({ type: BrandingUploadResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Tenant does not belong to the caller.',
  })
  async uploadBranding(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UploadBrandingDto,
    @UploadedFile() file?: UploadedBrandingFile,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<BrandingUploadResponseDto> {
    return this.tenants.uploadBranding(
      tenantId,
      requireSub(user),
      dto.type,
      file,
    );
  }

  /** Updates the tenant site's SEO title, description and og:site_name. */
  @Patch(':tenantId/site-settings')
  @ApiOperation({ summary: 'Update tenant site SEO settings (protected)' })
  @ApiOkResponse({ type: TenantBrandingDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Tenant does not belong to the caller.',
  })
  async updateSiteSettings(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateSiteSettingsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<TenantBrandingDto> {
    return this.tenants.updateSiteSettings(tenantId, requireSub(user), dto);
  }

  /** Clears one branding slot and deletes the stored image. */
  @Delete(':tenantId/branding/:type')
  @ApiParam({ name: 'type', enum: [...BRANDING_TYPES] })
  @ApiOperation({ summary: 'Remove a tenant branding image (protected)' })
  @ApiOkResponse({ type: TenantBrandingDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Tenant does not belong to the caller.',
  })
  async removeBranding(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('type', new ParseEnumPipe(BRANDING_TYPES)) type: BrandingType,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<TenantBrandingDto> {
    return this.tenants.removeBranding(tenantId, requireSub(user), type);
  }
}

/** The guard guarantees a user; this narrows the type defensively. */
function requireSub(user?: AuthenticatedUser): string {
  if (!user) throw new UnauthorizedException();
  return user.sub;
}
