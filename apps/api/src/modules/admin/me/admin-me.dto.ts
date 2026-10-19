import { ApiProperty } from '@nestjs/swagger';
import type { AdminRole } from '../auth/admin-roles.decorator';

export class AdminMeResponseDto {
  /** Supabase user id (`sub`) of the active admin member. */
  @ApiProperty()
  userId!: string;

  /** Email claim, or null when the token has none. */
  @ApiProperty({ type: String, nullable: true })
  email!: string | null;

  /** Active role stored in admin.members. */
  @ApiProperty({ enum: ['owner', 'operator', 'viewer'] })
  role!: AdminRole;
}
