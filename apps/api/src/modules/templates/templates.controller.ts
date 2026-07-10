import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { TemplateListItemDto } from './dto/template-list-item.dto';
import { TemplatesService } from './templates.service';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(SupabaseJwtGuard)
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  /** Lists active templates for the gallery (protected). */
  @Get()
  @ApiOperation({ summary: 'List active templates (protected)' })
  @ApiOkResponse({ type: TemplateListItemDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async findAll(): Promise<TemplateListItemDto[]> {
    return this.templates.findAll();
  }
}
