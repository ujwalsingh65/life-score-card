-- Drop existing avatar storage policies that include anon role
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

-- Recreate policies with proper role restrictions

-- Public read access for avatars (this is intentional for public leaderboard)
-- This policy is SELECT only, so anonymous users can VIEW but not modify
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Only authenticated users can upload avatars to their own folder
CREATE POLICY "Authenticated users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Only authenticated users can update their own avatars
CREATE POLICY "Authenticated users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Only authenticated users can delete their own avatars  
CREATE POLICY "Authenticated users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);