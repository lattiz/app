import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { MeModule } from './modules/me/me.module';

@Module({
  imports: [HealthModule, MeModule],
})
export class AppModule {}
