import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PreviewModule } from '../../common/billing/preview.module';
import { ImagesModule } from '../../common/images/images.module';
import { DatabaseModule } from '../../database/database.module';
import { SitesModule } from '../sites/sites.module';
import { STOCK_PHOTO_PROVIDER } from './domain/stock-photo-provider.port';
import { PexelsStockPhotoAdapter } from './infrastructure/pexels-stock-photo.adapter';
import { SiteStockAssetsController, StockController } from './stock.controller';
import { StockRateLimitGuard } from './stock-rate-limit.guard';
import { StockService } from './stock.service';

@Module({
  imports: [DatabaseModule, ImagesModule, PreviewModule, SitesModule],
  controllers: [StockController, SiteStockAssetsController],
  providers: [
    StockService,
    StockRateLimitGuard,
    {
      provide: STOCK_PHOTO_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const key = config.get<string>('PEXELS_API_KEY')?.trim() || undefined;
        if (!key) {
          new Logger('StockModule').warn(
            'PEXELS_API_KEY is not set — free stock photos are disabled.',
          );
        }
        return new PexelsStockPhotoAdapter(key);
      },
    },
  ],
})
export class StockModule {}
