-- ======================================================================
-- STORAGE RLS POLICIES FOR AUDIO-FILES BUCKET
-- ======================================================================
-- Run this SQL in your Supabase Dashboard > SQL Editor
-- This will set up Row Level Security policies for the audio-files bucket
-- so users can only access their own files.
-- ======================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Policy 1: Users can upload (INSERT) their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'audio-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view (SELECT) their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'audio-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update (UPDATE) their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'audio-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete (DELETE) their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'audio-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ======================================================================
-- VERIFICATION QUERIES
-- ======================================================================
-- Run these queries to verify the policies were created successfully
-- ======================================================================

-- Check all storage policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- ======================================================================
-- SUCCESS!
-- ======================================================================
-- After running this SQL, your storage bucket should be properly secured.
-- Users will only be able to upload, view, update, and delete their own files.
-- Files are organized by user_id as: audio-files/{user_id}/{filename}
-- ======================================================================
