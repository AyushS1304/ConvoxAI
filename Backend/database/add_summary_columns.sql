-- ============================================
-- MIGRATION: Add summary data columns to audio_files table
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Add new columns for storing summary data
ALTER TABLE audio_files
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS key_aspects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS no_of_participants INTEGER,
ADD COLUMN IF NOT EXISTS sentiment TEXT;

-- Add index for faster queries on files with summaries
CREATE INDEX IF NOT EXISTS idx_audio_files_has_summary 
ON audio_files((summary IS NOT NULL));

-- Comment the columns for documentation
COMMENT ON COLUMN audio_files.summary IS 'AI-generated summary of the audio content';
COMMENT ON COLUMN audio_files.transcript IS 'Full transcript of the audio file';
COMMENT ON COLUMN audio_files.key_aspects IS 'Key discussion points extracted from the audio';
COMMENT ON COLUMN audio_files.duration_minutes IS 'Duration of the call in minutes';
COMMENT ON COLUMN audio_files.no_of_participants IS 'Number of participants in the call';
COMMENT ON COLUMN audio_files.sentiment IS 'Overall sentiment of the call (Positive/Negative/Neutral)';
