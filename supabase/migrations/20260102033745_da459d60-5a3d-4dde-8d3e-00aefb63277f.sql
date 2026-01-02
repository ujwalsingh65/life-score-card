-- Create a secure view for leaderboard data that only exposes non-sensitive columns
CREATE VIEW public.leaderboard_profiles AS
SELECT 
  id,
  display_name,
  selected_avatar_id,
  selected_title_id
FROM public.profiles;

-- Drop the overly permissive policy that exposes onesignal_player_id
DROP POLICY IF EXISTS "Authenticated users can view all profiles for leaderboard" ON public.profiles;