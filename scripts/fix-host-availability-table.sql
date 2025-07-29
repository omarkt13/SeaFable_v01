
-- Fix host_availability table structure
-- This ensures the table has all required columns with correct names

-- Drop and recreate the table with correct structure
DROP TABLE IF EXISTS public.host_availability CASCADE;

CREATE TABLE public.host_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
    experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available_capacity INTEGER NOT NULL DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    price_override DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    weather_dependent BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(host_profile_id, experience_id, date, start_time)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_availability_experience_id ON public.host_availability (experience_id);
CREATE INDEX IF NOT EXISTS idx_host_availability_date_time ON public.host_availability (date, start_time);
CREATE INDEX IF NOT EXISTS idx_host_availability_host_profile_id ON public.host_availability (host_profile_id);

-- Enable RLS
ALTER TABLE public.host_availability ENABLE ROW LEVEL SECURITY;

-- Policy for hosts to manage their own availability
DROP POLICY IF EXISTS "Hosts can manage their own availability" ON public.host_availability;
CREATE POLICY "Hosts can manage their own availability" ON public.host_availability
    FOR ALL USING (
        host_profile_id IN (
            SELECT id FROM public.host_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for authenticated users to view availability
DROP POLICY IF EXISTS "Anyone can view availability" ON public.host_availability;
CREATE POLICY "Anyone can view availability" ON public.host_availability
    FOR SELECT USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_host_availability ON public.host_availability;
CREATE TRIGGER set_updated_at_host_availability
    BEFORE UPDATE ON public.host_availability
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
