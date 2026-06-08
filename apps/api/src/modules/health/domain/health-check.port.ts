/** Result of probing a single external dependency. */
export interface DependencyStatus {
  name: string;
  status: 'up' | 'down';
}

/** Port for probing external dependency health. Swap adapter without touching use-case layer. */
export interface HealthCheckPort {
  probe(): Promise<DependencyStatus[]>;
}

/** DI token for {@link HealthCheckPort} (interfaces vanish at runtime). */
export const HEALTH_CHECK_PORT = Symbol('HEALTH_CHECK_PORT');
