-- ResumeX Database Schema
-- PostgreSQL 16+

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    profile_type TEXT CHECK (profile_type IN ('fresher', 'experienced', 'tech', 'non_tech')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tex_path TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_pro_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on tags for template searches
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    form_data JSONB NOT NULL DEFAULT '{
        "personal": {"name": "", "email": "", "phone": "", "linkedin": ""},
        "education": [],
        "experience": [],
        "skills": [],
        "projects": []
    }'::jsonb,
    latex_source TEXT NOT NULL DEFAULT '',
    forked_from UUID REFERENCES resumes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_template_id ON resumes(template_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- Compile jobs table (for debugging and rate limiting)
CREATE TABLE IF NOT EXISTS compile_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'error')),
    error_log TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for compile_jobs
CREATE INDEX IF NOT EXISTS idx_compile_jobs_resume_id ON compile_jobs(resume_id);
CREATE INDEX IF NOT EXISTS idx_compile_jobs_status ON compile_jobs(status);
CREATE INDEX IF NOT EXISTS idx_compile_jobs_created_at ON compile_jobs(created_at DESC);

-- Subscriptions table (Post-MVP, for Stripe integration)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due')),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default templates (will be replaced with actual .tex files later)
INSERT INTO templates (name, description, tex_path, tags, is_pro_only) VALUES
    ('Minimal Tech', 'Clean, ATS-friendly template for tech professionals', '/templates/minimal-tech.tex', ARRAY['tech', 'ats-friendly', 'minimal'], FALSE),
    ('Modern Professional', 'Two-column layout for experienced professionals', '/templates/modern-pro.tex', ARRAY['experienced', 'two-column'], FALSE),
    ('Academic Fresher', 'Emphasizes education and projects for freshers', '/templates/academic-fresher.tex', ARRAY['fresher', 'academic'], FALSE),
    ('Creative Designer', 'Elegant typography for creative roles', '/templates/creative.tex', ARRAY['creative', 'design'], TRUE),
    ('Tech Lead', 'Dense layout for senior tech roles', '/templates/tech-lead.tex', ARRAY['tech', 'senior', 'compact'], TRUE)
ON CONFLICT DO NOTHING;
