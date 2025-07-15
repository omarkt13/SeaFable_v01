-- Migration: Expand activity types and add new tables
-- This migration enhances the experiences table with activity-specific fields
-- and creates new tables for equipment and certifications

-- Add new columns to experiences table
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS activity_type VARCHAR(50) DEFAULT 'sailing';
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS activity_specific_details JSONB DEFAULT '{}';
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'beginner';
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 8;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS min_age INTEGER;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS equipment_provided TEXT[];
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS what_to_bring TEXT[];
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS weather_dependency BOOLEAN DEFAULT true;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS instant_booking BOOLEAN DEFAULT false;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS included_services TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS excluded_services TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Rename captain_profiles to host_profiles and add new columns
ALTER TABLE IF EXISTS captain_profiles RENAME TO host_profiles;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'captain';
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English']::TEXT[];
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('safety', 'activity', 'comfort', 'navigation')),
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'needs_replacement')),
    last_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    description TEXT,
    validity_period INTEGER, -- in months
    category VARCHAR(50) NOT NULL CHECK (category IN ('safety', 'instruction', 'navigation', 'specialized')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create host_certifications junction table
CREATE TABLE IF NOT EXISTS host_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE NOT NULL,
    certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    certification_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(host_id, certification_id)
);

-- Create experience_equipment junction table
CREATE TABLE IF NOT EXISTS experience_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
    quantity_required INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(experience_id, equipment_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_activity_type ON experiences (activity_type);
CREATE INDEX IF NOT EXISTS idx_experiences_difficulty_level ON experiences (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_experiences_business_id ON experiences (business_id);
CREATE INDEX IF NOT EXISTS idx_host_profiles_role ON host_profiles (role);
CREATE INDEX IF NOT EXISTS idx_equipment_business_id ON equipment (business_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment (category);
CREATE INDEX IF NOT EXISTS idx_certifications_category ON certifications (category);

-- Add updated_at triggers
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_experiences') THEN
        CREATE TRIGGER set_updated_at_experiences
        BEFORE UPDATE ON experiences
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_host_profiles') THEN
        CREATE TRIGGER set_updated_at_host_profiles
        BEFORE UPDATE ON host_profiles
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_equipment') THEN
        CREATE TRIGGER set_updated_at_equipment
        BEFORE UPDATE ON equipment
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_certifications') THEN
        CREATE TRIGGER set_updated_at_certifications
        BEFORE UPDATE ON certifications
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_equipment ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for equipment
CREATE POLICY "Allow business owners to manage their equipment"
ON equipment FOR ALL
TO authenticated
USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

-- Add RLS policies for certifications (read-only for all authenticated users)
CREATE POLICY "Allow authenticated users to view certifications"
ON certifications FOR SELECT
TO authenticated
USING (true);

-- Add RLS policies for host_certifications
CREATE POLICY "Allow business owners to manage host certifications"
ON host_certifications FOR ALL
TO authenticated
USING (host_id IN (
    SELECT hp.id FROM host_profiles hp 
    JOIN business_profiles bp ON hp.business_id = bp.id 
    WHERE bp.user_id = auth.uid()
));

-- Add RLS policies for experience_equipment
CREATE POLICY "Allow business owners to manage experience equipment"
ON experience_equipment FOR ALL
TO authenticated
USING (experience_id IN (
    SELECT e.id FROM experiences e 
    JOIN business_profiles bp ON e.business_id = bp.id 
    WHERE bp.user_id = auth.uid()
));
