import {
  Inject,
  Injectable,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DATABASE = Symbol('DATABASE');
export type Database = ReturnType<typeof drizzle<typeof schema>>;

/** Ends the postgres.js pool; otherwise `app.close()` leaves the process running. */
@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async onApplicationShutdown(): Promise<void> {
    await this.db.$client.end({ timeout: 5 });
  }
}

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: (): Database => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is not set');
        const client = postgres(url, { max: 10 });
        return drizzle(client, { schema });
      },
    },
    DatabaseLifecycle,
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
