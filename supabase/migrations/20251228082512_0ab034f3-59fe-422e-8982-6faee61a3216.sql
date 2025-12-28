-- Add daily XP tracking columns to player_stats
ALTER TABLE public.player_stats 
ADD COLUMN IF NOT EXISTS daily_xp_earned integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_xp_date date NOT NULL DEFAULT CURRENT_DATE;