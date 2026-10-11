import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ImageOptimizer,
  imageOptimizerOptionsFromEnv,
} from './image-optimizer';

/** One ImageOptimizer per process, so every importer shares the same concurrency gate. */
@Module({
  providers: [
    {
      provide: ImageOptimizer,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new ImageOptimizer(
          imageOptimizerOptionsFromEnv((key) => config.get<string>(key)),
        ),
    },
  ],
  exports: [ImageOptimizer],
})
export class ImagesModule {}
