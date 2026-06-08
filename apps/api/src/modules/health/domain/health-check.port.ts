/** Result of probing a single external dependency. */
export interface DependencyStatus {
  name: string;
  status: 'up' | 'down';
}

/**
 * Port for probing the health of external dependencies (database, queues, …).
 *
 * This is the kind of boundary hexagonal layering exists for: the concrete
 * probe is an infrastructure concern. Today it is an in-memory mock; once a
 * real datastore is chosen it becomes a new adapter with no change to the
 * application layer.
 */
export interface HealthCheckPort {
  probe(): Promise<DependencyStatus[]>;
}

/** DI token for {@link HealthCheckPort} (interfaces vanish at runtime). */
export const HEALTH_CHECK_PORT = Symbol('HEALTH_CHECK_PORT');
