export const EMAIL_PROVIDER_PORT = Symbol('EMAIL_PROVIDER_PORT');

export interface SendEmailInput {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Passed as Resend's Idempotency-Key header (outbox row id). */
  idempotencyKey: string;
}

export type SendEmailResult =
  | { ok: true; messageId: string }
  | {
      ok: false;
      retryable: boolean;
      statusCode?: number;
      error: string;
    };

export interface EmailProviderPort {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
