-- Performance optimization script for SeaFable database
-- Add indexes for frequently queried columns

-- Experiences table indexes
CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON experiences USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_experiences_activity_type ON experiences(activity_type);
CREATE INDEX IF NOT EXISTS idx_experiences_difficulty_level ON experiences(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_experiences_price_range ON experiences(price_per_person);
CREATE INDEX IF NOT EXISTS idx_experiences_rating ON experiences(rating DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_search ON experiences USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(booked_at DESC);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_experience_id ON reviews(experience_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_host_id ON reviews(host_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Host availability indexes
CREATE INDEX IF NOT EXISTS idx_host_availability_profile_id ON host_availability(host_profile_id);
CREATE INDEX IF NOT EXISTS idx_host_availability_date ON host_availability(date);
CREATE INDEX IF NOT EXISTS idx_host_availability_date_range ON host_availability(date, start_time, end_time);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_experiences_active_location ON experiences(is_active, location) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_experiences_active_type ON experiences(is_active, activity_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_experiences_active_price ON experiences(is_active, price_per_person) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_host_status ON bookings(host_id, booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, booking_status);

-- Add database functions for better performance
CREATE OR REPLACE FUNCTION increment_host_experience_count(host_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE host_profiles 
  SET total_experiences = COALESCE(total_experiences, 0) + 1
  WHERE id = host_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_experience_stats(exp_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE experiences 
  SET 
    rating = COALESCE((
      SELECT AVG(rating)::numeric(3,2) 
      FROM reviews 
      WHERE experience_id = exp_id
    ), 0),
    total_reviews = COALESCE((
      SELECT COUNT(*) 
      FROM reviews 
      WHERE experience_id = exp_id
    ), 0),
    total_bookings = COALESCE((
      SELECT COUNT(*) 
      FROM bookings 
      WHERE experience_id = exp_id 
      AND booking_status IN ('confirmed', 'completed')
    ), 0)
  WHERE id = exp_id;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to automatically update statistics
CREATE OR REPLACE FUNCTION trigger_update_experience_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_experience_stats(NEW.experience_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM update_experience_stats(NEW.experience_id);
    IF OLD.experience_id != NEW.experience_id THEN
      PERFORM update_experience_stats(OLD.experience_id);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_experience_stats(OLD.experience_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_reviews_stats ON reviews;
CREATE TRIGGER trigger_reviews_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trigger_update_experience_stats();

DROP TRIGGER IF EXISTS trigger_bookings_stats ON bookings;
CREATE TRIGGER trigger_bookings_stats
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_experience_stats();

-- Add materialized view for dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS host_dashboard_stats AS
SELECT 
  hp.id as host_id,
  hp.name as host_name,
  COUNT(DISTINCT e.id) as total_experiences,
  COUNT(DISTINCT b.id) as total_bookings,
  COALESCE(SUM(CASE WHEN b.booking_status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_revenue,
  COALESCE(AVG(e.rating), 0) as average_rating,
  COUNT(DISTINCT CASE WHEN b.booking_status IN ('confirmed', 'pending') THEN b.id END) as active_bookings,
  MAX(b.booked_at) as last_booking_date
FROM host_profiles hp
LEFT JOIN experiences e ON hp.id = e.host_id AND e.is_active = true
LEFT JOIN bookings b ON hp.id = b.host_id
GROUP BY hp.id, hp.name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_host_dashboard_stats_host_id ON host_dashboard_stats(host_id);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY host_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for better security
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_availability ENABLE ROW LEVEL SECURITY;

-- Experiences policies
CREATE POLICY "Public experiences are viewable by everyone" ON experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their own experiences" ON experiences
  FOR ALL USING (auth.uid() = host_id);

-- Bookings policies  
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = host_id);

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update bookings for their experiences" ON bookings
  FOR UPDATE USING (auth.uid() = host_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = booking_id 
      AND bookings.user_id = auth.uid()
      AND bookings.booking_status = 'completed'
    )
  );

-- Host availability policies
CREATE POLICY "Host availability is viewable by everyone" ON host_availability
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage their own availability" ON host_availability
  FOR ALL USING (auth.uid() = host_profile_id);

COMMIT;
