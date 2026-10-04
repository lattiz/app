-- Transactional email outbox. API-only: no client policies, revoked from anon/authenticated.
-- tenant_id is intentionally NOT a foreign key so account-deletion emails survive cascades.

CREATE TABLE IF NOT EXISTS public.email_outbox (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                 TEXT NOT NULL,
  idempotency_key      TEXT NOT NULL,
  to_email             TEXT NOT NULL,
  tenant_id            UUID NULL,
  payload              JSONB NOT NULL DEFAULT '{}'::jsonb,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts             INT NOT NULL DEFAULT 0,
  next_attempt_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error           TEXT,
  provider_message_id  TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at              TIMESTAMPTZ,
  CONSTRAINT email_outbox_idempotency_key_unique UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS email_outbox_status_next_attempt_idx
  ON public.email_outbox (status, next_attempt_at);

DROP TRIGGER IF EXISTS email_outbox_set_updated_at ON public.email_outbox;
CREATE TRIGGER email_outbox_set_updated_at
  BEFORE UPDATE ON public.email_outbox
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.email_outbox FROM anon, authenticated;
