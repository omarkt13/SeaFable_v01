
-- Fix Authentication Issues
-- This script addresses RLS policies, foreign key relationships, and missing columns

-- 1. Fix RLS policies for host_profiles to allow authenticated users to create profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON host_profiles;
CREATE POLICY "Users can insert their own profile" ON host_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON host_profiles;
CREATE POLICY "Users can view their own profile" ON host_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON host_profiles;
CREATE POLICY "Users can update their own profile" ON host_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Fix bookings table to have proper date columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Update existing bookings to use proper date format if they exist
UPDATE bookings 
SET start_date = booking_date::DATE 
WHERE start_date IS NULL AND booking_date IS NOT NULL;

-- 3. Ensure host_business_settings has proper RLS
DROP POLICY IF EXISTS "Users can manage their business settings" ON host_business_settings;
CREATE POLICY "Users can manage their business settings" ON host_business_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM host_profiles 
      WHERE host_profiles.id = host_business_settings.host_profile_id 
      AND host_profiles.user_id = auth.uid()
    )
  );

-- 4. Fix any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_profiles_user_id ON host_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);

-- 5. Ensure experiences table has proper relationship with host_profiles
ALTER TABLE experiences 
ADD CONSTRAINT fk_experiences_host_id 
FOREIGN KEY (host_id) REFERENCES host_profiles(id) 
ON DELETE CASCADE;

-- 6. Grant necessary permissions
GRANT ALL ON host_profiles TO authenticated;
GRANT ALL ON host_business_settings TO authenticated;
GRANT ALL ON experiences TO authenticated;
GRANT ALL ON bookings TO authenticated;
