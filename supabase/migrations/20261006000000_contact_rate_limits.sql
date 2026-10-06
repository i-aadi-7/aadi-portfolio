-- Migration: Atomic Contact Rate Limiting Table & Advisory Lock RPC
-- Creates contact_rate_limits table and a transaction-locked atomic rate limit RPC.

CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for sliding window lookup by hashed IP and creation time
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_ip_created
  ON public.contact_rate_limits (ip_hash, created_at DESC);

-- Index for fast 24-hour retention cleanup
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_created_at
  ON public.contact_rate_limits (created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Revoke all direct public/anon/authenticated access to table
REVOKE ALL ON public.contact_rate_limits FROM PUBLIC, anon, authenticated;

-- Atomic Check & Record Rate Limit Function
-- Uses transaction-scoped advisory locks to eliminate check-then-act race conditions
CREATE OR REPLACE FUNCTION public.check_and_record_contact_rate_limit(
  p_ip_hash TEXT,
  p_limit INTEGER DEFAULT 3,
  p_window_seconds INTEGER DEFAULT 600
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 1. Take a transaction-scoped advisory lock derived from p_ip_hash
  -- Serializes concurrent requests for the exact same IP hash across transactions
  PERFORM pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  -- 2. Self-cleaning retention: purge expired records older than 24 hours
  DELETE FROM public.contact_rate_limits
  WHERE created_at < (now() - interval '24 hours');

  -- 3. Count recent attempts for this IP hash within the sliding window
  SELECT count(*)
  INTO v_count
  FROM public.contact_rate_limits
  WHERE ip_hash = p_ip_hash
    AND created_at >= (now() - (p_window_seconds || ' seconds')::interval);

  -- 4. If limit reached, return false without recording
  IF v_count >= p_limit THEN
    RETURN FALSE;
  END IF;

  -- 5. Otherwise, atomically record this attempt and return true
  INSERT INTO public.contact_rate_limits (ip_hash)
  VALUES (p_ip_hash);

  RETURN TRUE;
END;
$$;

-- Lock down function execution permissions: callable only via service_role in Edge Function
REVOKE ALL ON FUNCTION public.check_and_record_contact_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_contact_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
