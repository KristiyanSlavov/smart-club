-- Migration: Create payment_logs table for digital receipts & payment history

CREATE TABLE public.payment_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  paid_for    text NOT NULL,
  paid_at     timestamptz NOT NULL DEFAULT now(),
  recorded_by text NOT NULL DEFAULT 'admin'
);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment logs are publicly readable"
  ON public.payment_logs FOR SELECT USING (true);

CREATE POLICY "Service role can insert payment logs"
  ON public.payment_logs FOR INSERT WITH CHECK (true);
