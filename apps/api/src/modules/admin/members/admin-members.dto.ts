import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, MaxLength } from 'class-validator';
import type { AdminRole } from '../auth/admin-roles.decorator';

export const ADMIN_MEMBER_ROLES = ['owner', 'operator', 'viewer'] as const;

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class AdminMemberDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ADMIN_MEMBER_ROLES })
  role!: AdminRole;

  @ApiProperty()
  createdAt!: string;

  /** Email of the member who granted access, when it is still known. */
  @ApiProperty({ type: String, nullable: true })
  createdBy!: string | null;

  @ApiProperty({ type: String, nullable: true })
  revokedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastSignInAt!: string | null;
}

export class AdminMemberListResponseDto {
  @ApiProperty({ type: [AdminMemberDto] })
  items!: AdminMemberDto[];
}

export class AdminGrantMemberDto {
  @ApiProperty()
  @Transform(trimString)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ enum: ADMIN_MEMBER_ROLES })
  @IsIn(ADMIN_MEMBER_ROLES)
  role!: AdminRole;
}

export class AdminUpdateMemberDto {
  @ApiProperty({ enum: ADMIN_MEMBER_ROLES })
  @IsString()
  @IsIn(ADMIN_MEMBER_ROLES)
  role!: AdminRole;
}
