-- Add policy for authenticated users to view all player stats (for leaderboard)
CREATE POLICY "Authenticated users can view all player stats for leaderboard"
ON public.player_stats
FOR SELECT
TO authenticated
USING (true);

-- Add policy for authenticated users to view all profiles (for leaderboard display names)
CREATE POLICY "Authenticated users can view all profiles for leaderboard"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);