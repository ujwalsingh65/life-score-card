-- Add reminder_time column to habits table (stores time in HH:MM format)
ALTER TABLE public.habits ADD COLUMN reminder_time time;

-- Add onesignal_player_id to profiles for push notifications
ALTER TABLE public.profiles ADD COLUMN onesignal_player_id text;