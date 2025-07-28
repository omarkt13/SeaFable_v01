
-- Final database cleanup to ensure everything is correct
-- Fix all remaining table and column references

-- Ensure user_profiles table exists and is properly structured
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bio TEXT,
    phone_number TEXT,
    location TEXT,
    date_of_birth DATE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    newsletter_enabled BOOLEAN DEFAULT FALSE,
    marketing_enabled BOOLEAN DEFAULT FALSE
);

-- Ensure bookings table has correct structure
ALTER TABLE bookings 
DROP COLUMN IF EXISTS customer_id,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS number_of_guests INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS departure_time TEXT,
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT[],
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop incorrect foreign key constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Add correct foreign key constraints
ALTER TABLE bookings 
ADD CONSTRAINT bookings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES host_profiles(id) ON DELETE CASCADE;

-- Ensure RLS policies are correct
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create correct policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Booking policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view their bookings" ON bookings;

CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view their bookings" ON bookings
    FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Remove any remaining references to business_profiles
-- (These should already be cleaned up, but this ensures it)
DO $$
BEGIN
    -- Drop any views or functions that might reference business_profiles
    DROP VIEW IF EXISTS business_profiles_view CASCADE;
    DROP FUNCTION IF EXISTS get_business_profile CASCADE;
END $$;

COMMENT ON TABLE user_profiles IS 'User profiles for customers and general users';
COMMENT ON TABLE host_profiles IS 'Host/business profiles (formerly business_profiles)';
COMMENT ON TABLE bookings IS 'Booking records with corrected foreign key references';
