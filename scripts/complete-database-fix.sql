
-- Complete Database Schema Fix
-- This script ensures all tables exist with correct relationships

BEGIN;

-- 1. Drop and recreate user_profiles table with correct structure
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    bio TEXT,
    location TEXT,
    date_of_birth DATE,
    notifications_enabled BOOLEAN DEFAULT true,
    newsletter_enabled BOOLEAN DEFAULT false,
    marketing_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure host_profiles table exists and is properly configured
CREATE TABLE IF NOT EXISTS public.host_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    business_type TEXT,
    location TEXT,
    description TEXT,
    bio TEXT,
    avatar_url TEXT,
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    specialties TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    host_type TEXT DEFAULT 'captain',
    languages_spoken TEXT[] DEFAULT '{}',
    business_registration_id TEXT,
    insurance_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Create experiences table
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    location TEXT,
    specific_location TEXT,
    country TEXT,
    activity_type TEXT,
    category TEXT[] DEFAULT '{}',
    duration_hours NUMERIC DEFAULT 1,
    duration_display TEXT,
    max_guests INTEGER DEFAULT 1,
    min_guests INTEGER DEFAULT 1,
    price_per_person NUMERIC(10,2) DEFAULT 0,
    difficulty_level TEXT DEFAULT 'beginner',
    rating NUMERIC(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    primary_image_url TEXT,
    weather_contingency TEXT,
    included_amenities TEXT[] DEFAULT '{}',
    what_to_bring TEXT[] DEFAULT '{}',
    min_age INTEGER,
    max_age INTEGER,
    age_restriction_details TEXT,
    activity_specific_details JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    seasonal_availability TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create bookings table with correct foreign keys
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    departure_time TIME,
    number_of_guests INTEGER DEFAULT 1,
    guest_details JSONB DEFAULT '{}',
    total_price NUMERIC(10,2) DEFAULT 0,
    booking_status TEXT DEFAULT 'pending',
    special_requests TEXT,
    dietary_requirements TEXT[] DEFAULT '{}',
    payment_id TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    amount_paid NUMERIC(10,2),
    currency TEXT DEFAULT 'EUR',
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create host_business_settings table
CREATE TABLE IF NOT EXISTS public.host_business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    marketplace_enabled BOOLEAN DEFAULT TRUE,
    auto_booking_enabled BOOLEAN DEFAULT FALSE,
    instant_booking_enabled BOOLEAN DEFAULT FALSE,
    cancellation_policy TEXT DEFAULT 'flexible',
    refund_policy TEXT DEFAULT 'full_refund_24h',
    contact_preferences JSONB DEFAULT '{"email": true, "phone": false, "sms": false}',
    notification_settings JSONB DEFAULT '{"new_bookings": true, "cancellations": true, "reviews": true, "payments": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(host_profile_id)
);

-- 6. Create host_availability table
CREATE TABLE IF NOT EXISTS public.host_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
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
    UNIQUE(host_profile_id, date, start_time)
);

-- Add max_capacity column if it doesn't exist
ALTER TABLE public.host_availability 
ADD COLUMN IF NOT EXISTS max_capacity INTEGER NOT NULL DEFAULT 1;

-- 7. Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_availability ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Create RLS policies for host_profiles
DROP POLICY IF EXISTS "Hosts can manage own profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Public can view host profiles" ON public.host_profiles;

CREATE POLICY "Hosts can manage own profile" ON public.host_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view host profiles" ON public.host_profiles
    FOR SELECT USING (true);

-- 10. Create RLS policies for experiences
DROP POLICY IF EXISTS "Hosts can manage own experiences" ON public.experiences;
DROP POLICY IF EXISTS "Public can view active experiences" ON public.experiences;

CREATE POLICY "Hosts can manage own experiences" ON public.experiences
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.host_profiles WHERE id = experiences.host_id
        )
    );

CREATE POLICY "Public can view active experiences" ON public.experiences
    FOR SELECT USING (is_active = true);

-- 11. Create RLS policies for bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Hosts can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view their bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.host_profiles WHERE id = bookings.host_id
        )
    );

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Create test data
DO $$
DECLARE
    test_user_id UUID;
    test_host_id UUID;
BEGIN
    -- Get or create a test user ID (this would be from auth.users in practice)
    SELECT gen_random_uuid() INTO test_user_id;
    
    -- Insert test user profile
    INSERT INTO public.user_profiles (
        id, first_name, last_name, email, role
    ) VALUES (
        test_user_id, 'Test', 'Business', 'test@business.com', 'business'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Insert test host profile
    INSERT INTO public.host_profiles (
        user_id, name, business_name, email, host_type
    ) VALUES (
        test_user_id, 'Test Business Host', 'Test Adventure Co', 'test@business.com', 'captain'
    ) ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        business_name = EXCLUDED.business_name
    RETURNING id INTO test_host_id;
    
    -- Insert test host business settings
    INSERT INTO public.host_business_settings (
        host_profile_id, onboarding_completed, marketplace_enabled
    ) VALUES (
        test_host_id, false, true
    ) ON CONFLICT (host_profile_id) DO NOTHING;
    
    -- Insert test availability slots
    FOR i IN 1..7 LOOP
        INSERT INTO public.host_availability (
            host_profile_id, date, start_time, end_time, 
            available_capacity, max_capacity
        ) VALUES (
            test_host_id, 
            CURRENT_DATE + i,
            '09:00', '18:00',
            6, 8
        ) ON CONFLICT (host_profile_id, date, start_time) DO UPDATE SET
            available_capacity = EXCLUDED.available_capacity,
            max_capacity = EXCLUDED.max_capacity;
    END LOOP;
    
END $$;

COMMIT;
