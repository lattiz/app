import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PreviewModule } from '../../common/billing/preview.module';
import { DatabaseModule } from '../../database/database.module';
import { EmailOutboxService } from './application/email-outbox.service';
import { PreviewNotifierService } from './application/preview-notifier.service';
import { EMAIL_OUTBOX_REPOSITORY_PORT } from './domain/email-outbox.port';
import { EMAIL_PROVIDER_PORT } from './domain/email-provider.port';
import { DrizzleEmailOutboxRepository } from './infrastructure/drizzle-email-outbox.repository';
import { EmailSenderCron } from './infrastructure/email-sender.cron';
import { LogEmailAdapter } from './infrastructure/log-email.adapter';
import { ResendEmailAdapter } from './infrastructure/resend-email.adapter';

function resolveEmailProvider(config: ConfigService) {
  const provider = (config.get<string>('EMAIL_PROVIDER') ?? 'log')
    .trim()
    .toLowerCase();

  if (provider === '' || provider === 'log') {
    return new LogEmailAdapter();
  }

  if (provider === 'resend') {
    const apiKey = config.get<string>('RESEND_API_KEY')?.trim();
    const from = config.get<string>('EMAIL_FROM')?.trim();
    if (!apiKey || !from) {
      throw new Error(
        'EMAIL_PROVIDER=resend requires RESEND_API_KEY and EMAIL_FROM to be set.',
      );
    }
    return new ResendEmailAdapter(apiKey);
  }

  throw new Error(
    `Unknown EMAIL_PROVIDER "${provider}"; expected "resend" or "log".`,
  );
}

@Module({
  imports: [DatabaseModule, PreviewModule],
  providers: [
    EmailOutboxService,
    EmailSenderCron,
    PreviewNotifierService,
    {
      provide: EMAIL_OUTBOX_REPOSITORY_PORT,
      useClass: DrizzleEmailOutboxRepository,
    },
    {
      provide: EMAIL_PROVIDER_PORT,
      inject: [ConfigService],
      useFactory: resolveEmailProvider,
    },
  ],
  exports: [EmailOutboxService],
})
export class EmailModule {}
