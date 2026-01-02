-- Create a leaderboard_stats view that only exposes total_xp (hides daily_xp_earned and last_xp_date)
CREATE OR REPLACE VIEW public.leaderboard_stats 
WITH (security_invoker = true)
AS
SELECT 
  id,
  total_xp
FROM public.player_stats;

-- Grant SELECT on the new view to authenticated users
GRANT SELECT ON public.leaderboard_stats TO authenticated;