import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export const STOCK_MAX_PER_PAGE = 24;

export class StockSearchQueryDto {
  @ApiProperty({ minLength: 2, maxLength: 80 })
  @IsString()
  @Length(2, 80)
  query!: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: STOCK_MAX_PER_PAGE,
    default: STOCK_MAX_PER_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(STOCK_MAX_PER_PAGE)
  perPage?: number;
}

export class ImportStockPhotoDto {
  /** Pexels photo id from GET /stock/photos; the server fetches the image itself. */
  @ApiProperty({ example: '3998429' })
  @Matches(/^\d{1,12}$/, { message: 'photoId must be a Pexels photo id' })
  photoId!: string;
}

export class StockPhotoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  width!: number;

  @ApiProperty()
  height!: number;

  @ApiProperty()
  alt!: string;

  @ApiProperty({ type: String, nullable: true })
  avgColor!: string | null;

  @ApiProperty()
  photographer!: string;

  @ApiProperty()
  photographerUrl!: string;

  /** The photo's page on pexels.com (attribution link). */
  @ApiProperty()
  pageUrl!: string;

  /** Small preview for the results grid (served by Pexels). */
  @ApiProperty()
  thumbUrl!: string;
}

export class StockSearchResponseDto {
  @ApiProperty({ type: [StockPhotoDto] })
  photos!: StockPhotoDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  totalResults!: number;

  @ApiProperty()
  hasNext!: boolean;
}

export class StockStatusDto {
  /** False when the API has no PEXELS_API_KEY; the dashboard hides "Fotos gratuitas". */
  @ApiProperty()
  enabled!: boolean;
}
