
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow user creation" ON users;
CREATE POLICY "Allow user creation" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Host Profiles Table Policies
DROP POLICY IF EXISTS "Public read access to host profiles" ON host_profiles;
CREATE POLICY "Public read access to host profiles" ON host_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Hosts can manage own profile" ON host_profiles;
CREATE POLICY "Hosts can manage own profile" ON host_profiles
  FOR ALL USING (auth.uid() = id);

-- Experiences Table Policies
DROP POLICY IF EXISTS "Public read access to experiences" ON experiences;
CREATE POLICY "Public read access to experiences" ON experiences
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated read access to experiences" ON experiences;
CREATE POLICY "Authenticated read access to experiences" ON experiences
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Hosts can manage own experiences" ON experiences;
CREATE POLICY "Hosts can manage own experiences" ON experiences
  FOR ALL USING (auth.uid() = host_id);

-- Bookings Table Policies
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hosts can read their bookings" ON bookings;
CREATE POLICY "Hosts can read their bookings" ON bookings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT host_id FROM experiences WHERE id = experience_id
    )
  );

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hosts can update bookings for their experiences" ON bookings;
CREATE POLICY "Hosts can update bookings for their experiences" ON bookings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT host_id FROM experiences WHERE id = experience_id
    )
  );
