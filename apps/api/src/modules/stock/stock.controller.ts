import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type AuthenticatedUser } from '../../common/auth/authenticated-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { PublishAllowedGuard } from '../../common/auth/publish-allowed.guard';
import { SupabaseJwtGuard } from '../../common/auth/supabase-jwt.guard';
import { PreviewRateLimitGuard } from '../../common/throttling/preview-rate-limit.guard';
import { PreviewAssetRateLimit } from '../../common/throttling/rate-limits';
import { UploadedAssetResponseDto } from '../sites/dto/sites.response.dto';
import {
  ImportStockPhotoDto,
  StockSearchQueryDto,
  StockSearchResponseDto,
  StockStatusDto,
} from './dto/stock.dto';
import { StockRateLimit, StockRateLimitGuard } from './stock-rate-limit.guard';
import { StockService } from './stock.service';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
@UseGuards(SupabaseJwtGuard)
export class StockController {
  constructor(private readonly stock: StockService) {}

  /** Whether free stock photos are configured on this API. */
  @Get('status')
  @ApiOperation({ summary: 'Stock photo feature status (protected)' })
  @ApiOkResponse({ type: StockStatusDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  status(): StockStatusDto {
    return this.stock.status();
  }

  /** Searches Pexels through the API (the key never reaches the browser). */
  @Get('photos')
  @UseGuards(StockRateLimitGuard)
  @StockRateLimit('search')
  @ApiOperation({ summary: 'Search free stock photos (protected)' })
  @ApiOkResponse({ type: StockSearchResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiTooManyRequestsResponse({
    description: 'Per-user limit or STOCK_QUOTA_LOW (provider quota).',
  })
  @ApiServiceUnavailableResponse({ description: 'STOCK_PHOTOS_DISABLED.' })
  search(@Query() query: StockSearchQueryDto): Promise<StockSearchResponseDto> {
    return this.stock.search(query.query, query.page, query.perPage);
  }
}

@ApiTags('sites')
@ApiBearerAuth()
@Controller('sites')
@UseGuards(SupabaseJwtGuard)
export class SiteStockAssetsController {
  constructor(private readonly stock: StockService) {}

  /** Imports a stock photo by id into the tenant's editor assets (optimized WebP in R2). */
  @Post(':tenantId/assets/stock')
  @UseGuards(PublishAllowedGuard, PreviewRateLimitGuard, StockRateLimitGuard)
  @PreviewAssetRateLimit()
  @StockRateLimit('import')
  @ApiOperation({ summary: 'Import a stock photo as a site asset (protected)' })
  @ApiOkResponse({ type: UploadedAssetResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiForbiddenResponse({
    description: 'Tenant does not belong to the caller.',
  })
  @ApiNotFoundResponse({ description: 'STOCK_PHOTO_NOT_FOUND.' })
  @ApiServiceUnavailableResponse({
    description: 'STOCK_PHOTOS_DISABLED or IMAGE_PROCESSING_BUSY.',
  })
  importPhoto(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: ImportStockPhotoDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<UploadedAssetResponseDto> {
    if (!user) throw new UnauthorizedException();
    return this.stock.importPhoto(tenantId, user.sub, dto.photoId);
  }
}
