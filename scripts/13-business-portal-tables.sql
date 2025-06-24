-- Host business settings and configuration
CREATE TABLE IF NOT EXISTS host_business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_profile_id UUID UNIQUE REFERENCES host_profiles(id) ON DELETE CASCADE,
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  website_url TEXT,
  social_media_links JSONB DEFAULT '{}',
  operating_license TEXT,
  insurance_policy_number TEXT,
  tax_id TEXT,
  bank_account_info JSONB DEFAULT '{}', -- Store encrypted bank details
  notification_preferences JSONB DEFAULT '{
    "emailBookings": true,
    "smsReminders": true,
    "weatherAlerts": true,
    "marketingEmails": false
  }',
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INT DEFAULT 1,
  marketplace_enabled BOOLEAN DEFAULT TRUE,
  auto_accept_bookings BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Host availability and calendar management
CREATE TABLE IF NOT EXISTS host_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_profile_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  available_capacity INT DEFAULT 1 CHECK (available_capacity >= 0),
  price_override NUMERIC(10,2),
  notes TEXT,
  weather_dependent BOOLEAN DEFAULT TRUE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern JSONB, -- {type: 'weekly', days: [1,2,3], endDate: '2024-12-31'}
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(host_profile_id, date, start_time)
);

-- Financial tracking and earnings
CREATE TABLE IF NOT EXISTS host_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_profile_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  gross_amount NUMERIC(10,2) NOT NULL CHECK (gross_amount >= 0),
  platform_fee NUMERIC(10,2) NOT NULL CHECK (platform_fee >= 0),
  payment_processing_fee NUMERIC(10,2) NOT NULL CHECK (payment_processing_fee >= 0),
  net_amount NUMERIC(10,2) NOT NULL CHECK (net_amount >= 0),
  currency VARCHAR(10) DEFAULT 'EUR',
  payout_date DATE,
  payout_status VARCHAR(50) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_transfer_id TEXT,
  transaction_id TEXT,
  fee_percentage NUMERIC(5,2) DEFAULT 15.0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Team member management
CREATE TABLE IF NOT EXISTS host_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_profile_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('captain', 'instructor', 'crew', 'admin', 'assistant')),
  permissions JSONB DEFAULT '["view_bookings"]',
  hourly_rate NUMERIC(10,2),
  commission_rate NUMERIC(5,2) CHECK (commission_rate >= 0 AND commission_rate <= 100),
  certifications TEXT[] DEFAULT '{}',
  hire_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(host_profile_id, user_id)
);

-- Business analytics and metrics
CREATE TABLE IF NOT EXISTS host_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_profile_id UUID REFERENCES host_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_bookings INT DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_guests INT DEFAULT 0,
  average_rating NUMERIC(3,2),
  cancellation_rate NUMERIC(5,2) DEFAULT 0,
  repeat_customer_rate NUMERIC(5,2) DEFAULT 0,
  marketplace_bookings INT DEFAULT 0,
  direct_bookings INT DEFAULT 0,
  weather_cancellations INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(host_profile_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_business_settings_host_id ON host_business_settings(host_profile_id);
CREATE INDEX IF NOT EXISTS idx_host_availability_host_date ON host_availability(host_profile_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_host_earnings_host_id ON host_earnings(host_profile_id);
CREATE INDEX IF NOT EXISTS idx_host_earnings_payout_status ON host_earnings(payout_status);
CREATE INDEX IF NOT EXISTS idx_host_team_members_host_id ON host_team_members(host_profile_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_host_analytics_host_date ON host_analytics(host_profile_id, date DESC);
