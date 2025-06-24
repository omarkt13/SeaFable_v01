CREATE TABLE IF NOT EXISTS host_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE NOT NULL,
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME WITH TIME ZONE NOT NULL,
    end_time TIME WITH TIME ZONE NOT NULL,
    capacity INT NOT NULL,
    price_override NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (experience_id, available_date, start_time)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_availability_experience_id ON host_availability (experience_id);
CREATE INDEX IF NOT EXISTS idx_host_availability_date_time ON host_availability (available_date, start_time);

-- Add updated_at trigger if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_host_availability') THEN
        CREATE TRIGGER set_updated_at_host_availability
        BEFORE UPDATE ON host_availability
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;
