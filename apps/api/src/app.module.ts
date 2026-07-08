import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { MeModule } from './modules/me/me.module';
import { SitesModule } from './modules/sites/sites.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    MeModule,
    SitesModule,
  ],
})
export class AppModule {}
