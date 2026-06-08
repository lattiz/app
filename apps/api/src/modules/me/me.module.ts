import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { GetMeUseCase } from './application/get-me.use-case';
import { USER_REPOSITORY_PORT } from './domain/user-repository.port';
import { DrizzleUserRepository } from './infrastructure/drizzle-user.repository';
import { MeController } from './interface/me.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MeController],
  providers: [
    GetMeUseCase,
    { provide: USER_REPOSITORY_PORT, useClass: DrizzleUserRepository },
  ],
})
export class MeModule {}
