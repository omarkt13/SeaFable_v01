
-- Fix missing columns in bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Create customer_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone_number TEXT,
  location TEXT,
  date_of_birth DATE,
  notifications_enabled BOOLEAN DEFAULT true,
  newsletter_enabled BOOLEAN DEFAULT false,
  marketing_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Customer profiles policies
CREATE POLICY "Users can view own customer profile" ON customer_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own customer profile" ON customer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customer profile" ON customer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view own user profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own user profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
