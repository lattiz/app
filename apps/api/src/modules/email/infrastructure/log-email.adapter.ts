import { Injectable, Logger } from '@nestjs/common';
import type {
  EmailProviderPort,
  SendEmailInput,
  SendEmailResult,
} from '../domain/email-provider.port';

/** Local/dev provider: logs the rendered email and reports success. */
@Injectable()
export class LogEmailAdapter implements EmailProviderPort {
  private readonly logger = new Logger(LogEmailAdapter.name);

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    this.logger.log(
      `[email:log] to=${input.to} subject=${JSON.stringify(input.subject)} idempotencyKey=${input.idempotencyKey}`,
    );
    this.logger.debug(`[email:log] text=\n${input.text}`);
    return { ok: true, messageId: `log_${input.idempotencyKey}` };
  }
}
