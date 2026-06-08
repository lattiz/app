import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import { profiles } from '../../../database/schema';
import { type UserProfile } from '../domain/user.entity';
import { type UserRepositoryPort } from '../domain/user-repository.port';

@Injectable()
export class DrizzleUserRepository implements UserRepositoryPort {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findById(id: string): Promise<UserProfile | null> {
    const rows = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return { id: row.id, displayName: row.displayName };
  }

  async save(profile: UserProfile): Promise<UserProfile> {
    const [row] = await this.db
      .insert(profiles)
      .values({ id: profile.id, displayName: profile.displayName })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          displayName: profile.displayName,
          updatedAt: new Date(),
        },
      })
      .returning();

    return { id: row.id, displayName: row.displayName };
  }
}
