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
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
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
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import {
  BrandingUploadResponseDto,
  TenantBrandingDto,
} from './dto/branding.response.dto';
import { TenantMeResponseDto } from './dto/tenants.response.dto';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import {
  BRANDING_TYPES,
  type BrandingType,
  UploadBrandingDto,
} from './dto/upload-branding.dto';
import { TenantsService, type UploadedBrandingFile } from './tenants.service';

// Ceiling for the multipart parser — the per-slot limit (1MB favicon, 4MB
// social preview) is enforced in the service, which knows the slot.
const MAX_BRANDING_BYTES = 4 * 1024 * 1024;

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
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
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
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
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
  @ApiForbiddenResponse({ description: 'Tenant does not belong to the caller.' })
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
