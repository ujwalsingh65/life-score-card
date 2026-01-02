-- Drop and recreate the view with SECURITY INVOKER to use the caller's permissions
DROP VIEW IF EXISTS public.leaderboard_profiles;

CREATE VIEW public.leaderboard_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  display_name,
  selected_avatar_id,
  selected_title_id
FROM public.profiles;