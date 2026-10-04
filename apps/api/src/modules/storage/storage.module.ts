import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OBJECT_STORAGE_PORT } from './domain/object-storage.port';
import {
  createObjectStorage,
  resolveStorageProvider,
} from './infrastructure/storage-provider.factory';

@Module({
  providers: [
    {
      provide: OBJECT_STORAGE_PORT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const read = (key: string) => config.get<string>(key);
        const storage = createObjectStorage(read);
        new Logger('StorageModule').log(
          `Object storage provider: ${resolveStorageProvider(read)}`,
        );
        return storage;
      },
    },
  ],
  exports: [OBJECT_STORAGE_PORT],
})
export class StorageModule {}
