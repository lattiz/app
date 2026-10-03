-- Leftover of drizzle-kit migrations; supabase/migrations is the only schema history now.
DROP SCHEMA IF EXISTS drizzle CASCADE;

-- Replaced by domain_jobs.error_code; raw provider text must never reach users.
ALTER TABLE public.domain_jobs DROP COLUMN IF EXISTS error_message;
