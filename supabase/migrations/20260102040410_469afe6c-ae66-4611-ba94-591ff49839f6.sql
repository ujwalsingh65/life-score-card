-- Fix RLS policies to explicitly target authenticated users only
-- This prevents anonymous users from accessing these tables

-- Habits table policies
DROP POLICY IF EXISTS "Users can create their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;

CREATE POLICY "Users can create their own habits"
ON public.habits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
ON public.habits FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON public.habits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habits"
ON public.habits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Habit logs table policies
DROP POLICY IF EXISTS "Users can create their own habit logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can delete their own habit logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can view their own habit logs" ON public.habit_logs;

CREATE POLICY "Users can create their own habit logs"
ON public.habit_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
ON public.habit_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habit logs"
ON public.habit_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Profiles table policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Player stats table policies
DROP POLICY IF EXISTS "Authenticated users can view all player stats for leaderboard" ON public.player_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.player_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.player_stats;
DROP POLICY IF EXISTS "Users can view their own stats" ON public.player_stats;

CREATE POLICY "Authenticated users can view all player stats for leaderboard"
ON public.player_stats FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own stats"
ON public.player_stats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own stats"
ON public.player_stats FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can view their own stats"
ON public.player_stats FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Unlocked achievements table policies
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.unlocked_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.unlocked_achievements;

CREATE POLICY "Users can unlock achievements"
ON public.unlocked_achievements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements"
ON public.unlocked_achievements FOR SELECT
TO authenticated
USING (auth.uid() = user_id);