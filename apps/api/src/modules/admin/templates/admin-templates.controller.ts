import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SupabaseJwtGuard } from '../../../common/auth/supabase-jwt.guard';
import { AdminAuditInterceptor } from '../audit/admin-audit.interceptor';
import { AdminRoles } from '../auth/admin-roles.decorator';
import { AdminGuard } from '../auth/admin.guard';
import {
  AdminTemplateDetailDto,
  AdminTemplateListQueryDto,
  AdminTemplateListResponseDto,
} from './admin-templates.dto';
import { AdminTemplatesService } from './admin-templates.service';

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
}
