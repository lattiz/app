import { Injectable, Logger } from '@nestjs/common';
import { EMAIL_FETCH_TIMEOUT_MS } from '../domain/email-kinds';
import type {
  EmailProviderPort,
  SendEmailInput,
  SendEmailResult,
} from '../domain/email-provider.port';

/**
 * Resend HTTP API via fetch.
 * Request: POST https://api.resend.com/emails with Authorization Bearer,
 * body { from, to, subject, html, text, reply_to }.
 * Idempotency: header Idempotency-Key (1–256 chars, 24h window).
 * Response 200: { id: string }.
 * @see https://resend.com/docs/api-reference/emails/send-email
 * @see https://resend.com/docs/dashboard/emails/idempotency-keys
 */
@Injectable()
export class ResendEmailAdapter implements EmailProviderPort {
  private readonly logger = new Logger(ResendEmailAdapter.name);

  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EMAIL_FETCH_TIMEOUT_MS);

    try {
      const response = await this.fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': input.idempotencyKey,
        },
        body: JSON.stringify({
          from: input.from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
          ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        }),
        signal: controller.signal,
      });

      const raw = await response.text();
      let body: { id?: string; message?: string; name?: string } = {};
      try {
        body = raw ? (JSON.parse(raw) as typeof body) : {};
      } catch {
        body = { message: raw.slice(0, 500) };
      }

      if (response.ok && body.id) {
        return { ok: true, messageId: body.id };
      }

      const statusCode = response.status;
      const error = body.message ?? body.name ?? `Resend HTTP ${statusCode}`;
      const retryable =
        statusCode === 429 ||
        statusCode >= 500 ||
        statusCode === 408 ||
        // Concurrent in-flight idempotent request; safe to retry later.
        (statusCode === 409 && body.name === 'concurrent_idempotent_requests');

      this.logger.warn(
        `Resend send failed (${statusCode}, retryable=${retryable}): ${error}`,
      );
      return { ok: false, retryable, statusCode, error };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Resend send error (retryable): ${error}`);
      return { ok: false, retryable: true, error };
    } finally {
      clearTimeout(timer);
    }
  }
}
