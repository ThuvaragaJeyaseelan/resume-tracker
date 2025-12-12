-- ATS Database Schema for Supabase
-- Run this SQL in Supabase Dashboard > SQL Editor

-- =====================================================
-- Job Postings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    description TEXT,
    requirements TEXT,
    status TEXT DEFAULT 'active',  -- active, closed, draft
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Applicants Table
-- =====================================================
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    resume_file_path TEXT NOT NULL,
    resume_text TEXT,
    
    -- AI Analysis Fields
    priority_score INTEGER DEFAULT 0,  -- 0-100 score
    summary TEXT,                       -- AI-generated brief summary
    key_skills JSONB,                   -- Array of key skills
    experience TEXT,                    -- AI-extracted experience summary
    education TEXT,                     -- AI-extracted education
    highlights JSONB,                   -- Array of standout points
    concerns JSONB,                     -- Array of potential concerns
    
    -- Status Tracking
    status TEXT DEFAULT 'new',          -- new, reviewed, shortlisted, rejected, hired
    notes TEXT,
    
    -- Relations
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_applicants_priority_score ON applicants(priority_score);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_job_posting_id ON applicants(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON applicants(created_at);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);

-- =====================================================
-- Updated_at Trigger Function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- Triggers for auto-updating updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
CREATE TRIGGER update_applicants_updated_at 
    BEFORE UPDATE ON applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at 
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (Optional - Enable if needed)
-- =====================================================
-- Uncomment below if you want to enable RLS

-- ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (public access)
-- CREATE POLICY "Allow all applicants operations" ON applicants FOR ALL USING (true);
-- CREATE POLICY "Allow all job_postings operations" ON job_postings FOR ALL USING (true);

