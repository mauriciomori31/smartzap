-- Migration: Add human_mode_expires_at for auto-timeout of human mode
-- Applied: 2026-01-23
-- When mode='human' and this timestamp passes, auto-switch back to 'bot'

ALTER TABLE public.inbox_conversations
ADD COLUMN IF NOT EXISTS human_mode_expires_at TIMESTAMPTZ;

-- Index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_inbox_conversations_human_mode_expires
ON public.inbox_conversations (human_mode_expires_at)
WHERE mode = 'human' AND human_mode_expires_at IS NOT NULL;

COMMENT ON COLUMN public.inbox_conversations.human_mode_expires_at IS
'When human mode should auto-expire back to bot mode. NULL = never expires.';
