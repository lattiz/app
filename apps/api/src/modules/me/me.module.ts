import { Module } from '@nestjs/common';
import { GetMeUseCase } from './application/get-me.use-case';
import { USER_REPOSITORY_PORT } from './domain/user-repository.port';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';
import { MeController } from './interface/me.controller';

@Module({
  controllers: [MeController],
  providers: [
    GetMeUseCase,
    // Mock persistence behind the port. Swap for a Drizzle/Prisma adapter later.
    { provide: USER_REPOSITORY_PORT, useClass: InMemoryUserRepository },
  ],
})
export class MeModule {}
