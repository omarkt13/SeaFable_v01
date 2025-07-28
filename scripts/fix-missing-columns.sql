
-- Fix missing columns in bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Fix user_profiles table if it doesn't exist
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

-- Ensure customer_profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS customer_profiles (
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

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add RLS policies for customer_profiles
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own customer profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update their own customer profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert their own customer profile" ON customer_profiles;

CREATE POLICY "Users can view their own customer profile" ON customer_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own customer profile" ON customer_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own customer profile" ON customer_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
