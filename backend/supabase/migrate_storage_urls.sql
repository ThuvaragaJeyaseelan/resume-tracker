-- Migration: Update resume_file_path column to store URLs instead of file paths
-- This is a data migration for existing records

-- Note: This migration does NOT change the column structure
-- The column name stays as 'resume_file_path' but will store full Supabase Storage URLs
-- Format: https://xxx.supabase.co/storage/v1/object/public/resumes/filename.pdf

-- For existing local file paths, they will need to be manually uploaded to Supabase Storage
-- Or the application will handle new uploads going forward

-- No schema changes needed - just documenting the data format change
-- Old format: /path/to/uploads/uuid.pdf
-- New format: https://xxx.supabase.co/storage/v1/object/public/resumes/uuid.pdf

COMMENT ON COLUMN applicants.resume_file_path IS 'Full URL to resume file in Supabase Storage';
