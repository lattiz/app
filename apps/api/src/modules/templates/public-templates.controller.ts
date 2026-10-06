import { Controller, Get, Header } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicReadRateLimit } from '../../common/throttling/rate-limits';
import { TemplateListItemDto } from './dto/template-list-item.dto';
import { TemplatesService } from './templates.service';

@ApiTags('templates')
@Controller('public/templates')
@PublicReadRateLimit()
export class PublicTemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  /** Template catalog for the landing page. No authentication; never includes the project JSON. */
  @Get()
  @Header(
    'Cache-Control',
    'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
  )
  @ApiOperation({ summary: 'List published templates (public)' })
  @ApiOkResponse({ type: TemplateListItemDto, isArray: true })
  async findPublished(): Promise<TemplateListItemDto[]> {
    return this.templates.findPublished();
  }
}
