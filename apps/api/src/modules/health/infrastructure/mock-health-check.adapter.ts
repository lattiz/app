import { Injectable } from '@nestjs/common';
import {
  type DependencyStatus,
  type HealthCheckPort,
} from '../domain/health-check.port';

/** Always reports `up` — replace with a real probe when adding monitored dependencies. */
@Injectable()
export class MockHealthCheckAdapter implements HealthCheckPort {
  async probe(): Promise<DependencyStatus[]> {
    return [{ name: 'mock', status: 'up' }];
  }
}
