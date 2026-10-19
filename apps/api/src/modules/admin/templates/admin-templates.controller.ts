import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { AdminAudit } from '../audit/admin-audit.decorator';
import { AdminAuditInterceptor } from '../audit/admin-audit.interceptor';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminGuard } from '../auth/admin.guard';
import {
  AdminTemplateDeleteDto,
  AdminTemplateDetailDto,
  AdminTemplateListQueryDto,
  AdminTemplateListResponseDto,
  AdminTemplateReorderDto,
  AdminTemplateReorderResponseDto,
  AdminTemplateRetireDto,
  AdminTemplateUpdateDto,
} from './admin-templates.dto';
import {
  AdminTemplatesService,
  MAX_TEMPLATE_THUMB_BYTES,
  type UploadedTemplateThumbnail,
} from './admin-templates.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/templates')
@UseGuards(SupabaseJwtGuard, AdminGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminTemplatesController {
  constructor(private readonly templates: AdminTemplatesService) {}

  /** Every template with usage counts. The project JSON stays on the server. */
  @Get()
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'List templates' })
  @ApiOkResponse({ type: AdminTemplateListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  list(
    @Query() query: AdminTemplateListQueryDto,
  ): Promise<AdminTemplateListResponseDto> {
    return this.templates.list(query);
  }

  /** Rewrites sort_order as 0, 10, 20… in the order received. */
  @Put('order')
  @AdminRoles('owner', 'operator')
  @AdminAudit('template.reorder', { targetType: 'template' })
  @ApiOperation({ summary: 'Reorder templates' })
  @ApiOkResponse({ type: AdminTemplateReorderResponseDto })
  @ApiBadRequestResponse({
    description: 'Unknown or repeated ids (TEMPLATE_ORDER_INVALID).',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async reorder(
    @Body() dto: AdminTemplateReorderDto,
    @Req() request: Request,
  ): Promise<AdminTemplateReorderResponseDto> {
    const result = await this.templates.reorder(dto.ids);
    request.adminAudit = { before: result.before, after: result.after };
    return { ids: result.ids };
  }

  @Get(':id')
  @AdminRoles('owner', 'operator')
  @ApiOperation({ summary: 'Get a template' })
  @ApiOkResponse({ type: AdminTemplateDetailDto })
  @ApiNotFoundResponse({ description: 'Unknown template (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  get(@Param('id') id: string): Promise<AdminTemplateDetailDto> {
    return this.templates.get(id);
  }

  /** Catalog copy only. Tier stays with the kit. */
  @Patch(':id')
  @AdminRoles('owner', 'operator')
  @AdminAudit('template.update', {
    targetType: 'template',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Update template catalog fields' })
  @ApiOkResponse({ type: AdminTemplateDetailDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiNotFoundResponse({ description: 'Unknown template (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: AdminTemplateUpdateDto,
    @Req() request: Request,
  ): Promise<AdminTemplateDetailDto> {
    const result = await this.templates.update(id, dto);
    request.adminAudit = { before: result.before, after: result.after };
    return result.template;
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner', 'operator')
  @AdminAudit('template.activate', {
    targetType: 'template',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Activate a template' })
  @ApiOkResponse({ type: AdminTemplateDetailDto })
  @ApiConflictResponse({
    description: 'Missing preview_url or thumbnail_url (TEMPLATE_NOT_READY).',
  })
  @ApiNotFoundResponse({ description: 'Unknown template (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async activate(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<AdminTemplateDetailDto> {
    const result = await this.templates.activate(id);
    request.adminAudit = { before: result.before, after: result.after };
    return result.template;
  }

  @Post(':id/retire')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner', 'operator')
  @AdminAudit('template.retire', {
    targetType: 'template',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Retire a template' })
  @ApiOkResponse({ type: AdminTemplateDetailDto })
  @ApiBadRequestResponse({ description: 'reason must be 3–300 characters.' })
  @ApiNotFoundResponse({ description: 'Unknown template (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async retire(
    @Param('id') id: string,
    @Body() dto: AdminTemplateRetireDto,
    @Req() request: Request,
  ): Promise<AdminTemplateDetailDto> {
    const result = await this.templates.retire(id, dto.reason);
    request.adminAudit = {
      reason: result.reason,
      before: result.before,
      after: result.after,
    };
    return result.template;
  }

  @Post(':id/thumbnail')
  @HttpCode(HttpStatus.OK)
  @AdminRoles('owner', 'operator')
  @AdminAudit('template.thumbnail', {
    targetType: 'template',
    targetParam: 'id',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_TEMPLATE_THUMB_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Replace a template thumbnail' })
  @ApiOkResponse({ type: AdminTemplateDetailDto })
  @ApiBadRequestResponse({
    description:
      'Missing file or magic bytes do not match (TEMPLATE_THUMBNAIL_REJECTED).',
  })
  @ApiNotFoundResponse({ description: 'Unknown template (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async replaceThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: UploadedTemplateThumbnail | undefined,
    @Req() request: Request,
  ): Promise<AdminTemplateDetailDto> {
    const result = await this.templates.replaceThumbnail(id, file);
    request.adminAudit = { before: result.before, after: result.after };
    return result.template;
  }

  /** Owner only. Removes the row; stored objects are left in place. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AdminAudit('template.delete', {
    targetType: 'template',
    targetParam: 'id',
  })
  @ApiOperation({ summary: 'Delete an unused template' })
  @ApiNoContentResponse({ description: 'The template row was deleted.' })
  @ApiBadRequestResponse({
    description: 'confirmId does not match (TEMPLATE_DELETE_CONFIRM).',
  })
  @ApiConflictResponse({
    description: 'Sites or archives still reference it (TEMPLATE_IN_USE).',
  })
  @ApiNotFoundResponse({ description: 'Unknown template (ADMIN_NOT_FOUND).' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Not an active admin, MFA missing, or role not allowed.',
  })
  async remove(
    @Param('id') id: string,
    @Body() dto: AdminTemplateDeleteDto,
    @Req() request: Request,
  ): Promise<void> {
    const result = await this.templates.remove(id, dto.confirmId);
    request.adminAudit = { before: result.before, after: { deleted: true } };
  }
}
