
CREATE TABLE IF NOT EXISTS host_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE NOT NULL,
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available_capacity INT NOT NULL,
    price_override NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (experience_id, date, start_time)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_availability_experience_id ON host_availability (experience_id);
CREATE INDEX IF NOT EXISTS idx_host_availability_date_time ON host_availability (date, start_time);
CREATE INDEX IF NOT EXISTS idx_host_availability_host_profile_id ON host_availability (host_profile_id);

-- Add RLS policies
ALTER TABLE host_availability ENABLE ROW LEVEL SECURITY;

-- Policy for hosts to manage their own availability
CREATE POLICY "Hosts can manage their own availability" ON host_availability
    FOR ALL USING (
        host_profile_id IN (
            SELECT id FROM host_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for authenticated users to view availability
CREATE POLICY "Anyone can view availability" ON host_availability
    FOR SELECT USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_host_availability ON host_availability;
CREATE TRIGGER set_updated_at_host_availability
    BEFORE UPDATE ON host_availability
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
