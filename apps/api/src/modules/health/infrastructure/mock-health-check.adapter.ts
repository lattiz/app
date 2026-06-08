import { Injectable } from '@nestjs/common';
import {
  type DependencyStatus,
  type HealthCheckPort,
} from '../domain/health-check.port';

/**
 * Mock adapter for {@link HealthCheckPort}.
 *
 * No real dependencies are connected in this session, so every probe reports
 * `up`. Replace with a real adapter (e.g. a DB ping) when persistence lands.
 */
@Injectable()
export class MockHealthCheckAdapter implements HealthCheckPort {
  async probe(): Promise<DependencyStatus[]> {
    return [{ name: 'mock', status: 'up' }];
  }
}
