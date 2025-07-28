The script updates the database schema, refactoring table names and policies related to user and host profiles.
```

```sql
-- SeaFable Database Schema Fix
-- Fix missing columns, constraints, and relationships

-- Fix missing columns in bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_details JSONB DEFAULT '{}';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dietary_requirements TEXT[] DEFAULT '{}';

-- Ensure proper foreign key constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_experience_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_host_id_fkey;

ALTER TABLE bookings ADD CONSTRAINT bookings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_experience_id_fkey 
  FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_host_id_fkey 
  FOREIGN KEY (host_id) REFERENCES host_profiles(id) ON DELETE CASCADE;

-- Fix experiences table constraints
ALTER TABLE experiences DROP CONSTRAINT IF EXISTS experiences_host_id_fkey;
ALTER TABLE experiences ADD CONSTRAINT experiences_host_id_fkey 
  FOREIGN KEY (host_id) REFERENCES host_profiles(id) ON DELETE CASCADE;

-- Fix reviews table constraints
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_experience_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_host_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_fkey;

ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_experience_id_fkey 
  FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_host_id_fkey 
  FOREIGN KEY (host_id) REFERENCES host_profiles(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
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

-- Create trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_host_profiles_updated_at ON host_profiles;
CREATE TRIGGER update_host_profiles_updated_at
    BEFORE UPDATE ON host_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for host_profiles
DROP POLICY IF EXISTS "Hosts can view own profile" ON host_profiles;
CREATE POLICY "Hosts can view own profile" ON host_profiles FOR SELECT USING (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view host profiles" ON host_profiles;
CREATE POLICY "Public can view host profiles" ON host_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hosts can update own profile" ON host_profiles;
CREATE POLICY "Hosts can update own profile" ON host_profiles FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Hosts can insert own profile" ON host_profiles;
CREATE POLICY "Hosts can insert own profile" ON host_profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- RLS Policies for experiences
DROP POLICY IF EXISTS "Public can view active experiences" ON experiences;
CREATE POLICY "Public can view active experiences" ON experiences FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Hosts can view own experiences" ON experiences;
CREATE POLICY "Hosts can view own experiences" ON experiences FOR SELECT USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts can manage own experiences" ON experiences;
CREATE POLICY "Hosts can manage own experiences" ON experiences FOR ALL USING (auth.uid() = host_id);

-- RLS Policies for bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id OR auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users and hosts can update bookings" ON bookings;
CREATE POLICY "Users and hosts can update bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = host_id);

-- RLS Policies for reviews
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
CREATE POLICY "Users can create reviews for their bookings" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users and hosts can update reviews" ON reviews;
CREATE POLICY "Users and hosts can update reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = host_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_is_active ON experiences(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_experience_id ON reviews(experience_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);