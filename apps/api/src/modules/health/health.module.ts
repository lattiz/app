import { Module } from '@nestjs/common';
import { CheckHealthUseCase } from './application/check-health.use-case';
import { HEALTH_CHECK_PORT } from './domain/health-check.port';
import { MockHealthCheckAdapter } from './infrastructure/mock-health-check.adapter';
import { HealthController } from './interface/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    CheckHealthUseCase,
    // Wire the port to its mock adapter. Swap this single line for a real
    // adapter (e.g. a Drizzle DB ping) if health should reflect dependencies.
    { provide: HEALTH_CHECK_PORT, useClass: MockHealthCheckAdapter },
  ],
})
export class HealthModule {}
