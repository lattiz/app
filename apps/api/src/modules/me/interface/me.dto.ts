import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ description: 'Profile id (matches the Supabase user id).' })
  id!: string;

  @ApiProperty()
  displayName!: string;
}

export class MeResponseDto {
  @ApiProperty({
    description: 'Supabase user id (the `sub` claim of the verified JWT).',
  })
  sub!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Email claim, when present in the token.',
  })
  email!: string | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'The full set of verified JWT claims.',
  })
  claims!: Record<string, unknown>;

  @ApiProperty({
    type: UserProfileDto,
    nullable: true,
    description: 'Application profile, or null if none exists yet.',
  })
  profile!: UserProfileDto | null;
}
