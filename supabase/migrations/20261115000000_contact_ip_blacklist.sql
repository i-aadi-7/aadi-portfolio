-- Migration: Contact IP Blacklist Table
-- Allows permanent or temporary blacklisting of abusive IP hashes

CREATE TABLE IF NOT EXISTS public.contact_ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by hashed IP
CREATE INDEX IF NOT EXISTS idx_contact_ip_blacklist_hash
  ON public.contact_ip_blacklist (ip_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_ip_blacklist ENABLE ROW LEVEL SECURITY;

-- Revoke all direct public/anon/authenticated access to table
REVOKE ALL ON public.contact_ip_blacklist FROM PUBLIC, anon, authenticated;

-- Allow service_role full control
GRANT ALL ON public.contact_ip_blacklist TO service_role;
