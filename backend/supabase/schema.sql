-- ATS Database Schema for Supabase
-- Run this SQL in Supabase Dashboard > SQL Editor

-- =====================================================
-- Recruiters Table (Authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Job Postings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES recruiters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department TEXT,
    description TEXT,
    requirements TEXT,
    location TEXT,
    employment_type TEXT DEFAULT 'full-time',  -- full-time, part-time, contract, internship
    salary_range TEXT,
    status TEXT DEFAULT 'draft',  -- draft, active, closed
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
    
    -- General AI Analysis Fields
    priority_score INTEGER DEFAULT 0,  -- 0-100 general score
    summary TEXT,                       -- AI-generated brief summary
    key_skills JSONB,                   -- Array of key skills
    experience TEXT,                    -- AI-extracted experience summary
    education TEXT,                     -- AI-extracted education
    highlights JSONB,                   -- Array of standout points
    concerns JSONB,                     -- Array of potential concerns
    
    -- Job-Specific AI Analysis Fields
    job_relevancy_score INTEGER DEFAULT 0,  -- 0-100 job-specific score
    job_match_summary TEXT,                  -- AI analysis against job requirements
    skill_matches JSONB,                     -- Skills that match job requirements
    skill_gaps JSONB,                        -- Missing skills for the job
    
    -- Status Tracking
    status TEXT DEFAULT 'new',          -- new, reviewed, shortlisted, rejected, hired
    notes TEXT,
    
    -- Relations
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_recruiters_email ON recruiters(email);
CREATE INDEX IF NOT EXISTS idx_recruiters_is_active ON recruiters(is_active);

CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter_id ON job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at);

CREATE INDEX IF NOT EXISTS idx_applicants_priority_score ON applicants(priority_score);
CREATE INDEX IF NOT EXISTS idx_applicants_job_relevancy_score ON applicants(job_relevancy_score);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_job_posting_id ON applicants(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON applicants(created_at);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);

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
DROP TRIGGER IF EXISTS update_recruiters_updated_at ON recruiters;
CREATE TRIGGER update_recruiters_updated_at 
    BEFORE UPDATE ON recruiters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at 
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
CREATE TRIGGER update_applicants_updated_at 
    BEFORE UPDATE ON applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (Optional - Enable for production)
-- =====================================================
-- ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recruiters (self access only)
-- CREATE POLICY "Recruiters can view own profile" ON recruiters 
--     FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Recruiters can update own profile" ON recruiters 
--     FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for job_postings (recruiter owns their jobs)
-- CREATE POLICY "Recruiters can manage own jobs" ON job_postings 
--     FOR ALL USING (recruiter_id = auth.uid());
-- CREATE POLICY "Public can view active jobs" ON job_postings 
--     FOR SELECT USING (status = 'active');

-- RLS Policies for applicants
-- CREATE POLICY "Recruiters can view applicants for their jobs" ON applicants 
--     FOR SELECT USING (job_posting_id IN (SELECT id FROM job_postings WHERE recruiter_id = auth.uid()));
-- CREATE POLICY "Public can insert applications" ON applicants 
--     FOR INSERT WITH CHECK (true);
