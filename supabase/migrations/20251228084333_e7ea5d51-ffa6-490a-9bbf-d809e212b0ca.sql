-- Add columns for avatar and title customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_avatar_id text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS selected_title_id text DEFAULT 'novice';