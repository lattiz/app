-- Originally created by Drizzle (apps/api/drizzle/migrations/0000_curvy_jackpot.sql); folded into the Supabase history.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY NOT NULL,
  display_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
