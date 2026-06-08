import { Inject, Injectable } from '@nestjs/common';
import {
  type DependencyStatus,
  type HealthCheckPort,
  HEALTH_CHECK_PORT,
} from '../domain/health-check.port';

export interface HealthReport {
  status: 'ok' | 'degraded';
  dependencies: DependencyStatus[];
}

/**
 * Aggregates dependency probes into an overall health verdict.
 * Depends only on the {@link HealthCheckPort}, never on a concrete adapter.
 */
@Injectable()
export class CheckHealthUseCase {
  constructor(
    @Inject(HEALTH_CHECK_PORT)
    private readonly healthCheck: HealthCheckPort,
  ) {}

  async execute(): Promise<HealthReport> {
    const dependencies = await this.healthCheck.probe();
    const status = dependencies.every((d) => d.status === 'up')
      ? 'ok'
      : 'degraded';
    return { status, dependencies };
  }
}
