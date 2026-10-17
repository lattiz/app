import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AdminAuditInterceptor } from './audit/admin-audit.interceptor';
import { AdminAuditService } from './audit/admin-audit.service';
import { AdminGuard } from './auth/admin.guard';
import { AdminMembersService } from './auth/admin-members.service';
import { AdminMeController } from './me/admin-me.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminMeController],
  providers: [
    AdminMembersService,
    AdminGuard,
    AdminAuditService,
    AdminAuditInterceptor,
  ],
  exports: [
    AdminMembersService,
    AdminGuard,
    AdminAuditService,
    AdminAuditInterceptor,
  ],
})
export class AdminModule {}
