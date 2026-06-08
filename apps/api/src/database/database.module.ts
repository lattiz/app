import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DATABASE = Symbol('DATABASE');
export type Database = ReturnType<typeof drizzle<typeof schema>>;

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
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
