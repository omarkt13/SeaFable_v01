
-- Complete Database Schema Fix
-- This script ensures all tables exist with correct relationships

-- 1. Ensure host_profiles table exists and is properly configured
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    bio TEXT,
    phone_number TEXT,
    location TEXT,
    date_of_birth DATE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    newsletter_enabled BOOLEAN DEFAULT FALSE,
    marketing_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fix bookings table to remove customer_id references
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS customer_id;

-- Ensure bookings table has correct structure
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    departure_time TIME,
    number_of_guests INTEGER NOT NULL DEFAULT 1,
    guest_details JSONB,
    total_price DECIMAL(10,2) NOT NULL,
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    special_requests TEXT,
    dietary_requirements TEXT[] DEFAULT '{}',
    payment_id TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
    amount_paid DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fix experiences table to reference host_profiles correctly
ALTER TABLE public.experiences 
DROP CONSTRAINT IF EXISTS experiences_host_id_fkey;

ALTER TABLE public.experiences 
ADD CONSTRAINT experiences_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.host_profiles(id) ON DELETE CASCADE;

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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create host_availability table
CREATE TABLE IF NOT EXISTS public.host_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available_capacity INTEGER NOT NULL DEFAULT 1,
    max_capacity INTEGER NOT NULL DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    price_override DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    weather_dependent BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(host_profile_id, date, start_time)
);

-- 7. Enable RLS on all tables
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_availability ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for host_profiles
DROP POLICY IF EXISTS "host_profiles_select_policy" ON public.host_profiles;
CREATE POLICY "host_profiles_select_policy" ON public.host_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "host_profiles_insert_policy" ON public.host_profiles;
CREATE POLICY "host_profiles_insert_policy" ON public.host_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "host_profiles_update_policy" ON public.host_profiles;
CREATE POLICY "host_profiles_update_policy" ON public.host_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 9. Create RLS policies for user_profiles
DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create RLS policies for bookings
DROP POLICY IF EXISTS "bookings_select_policy" ON public.bookings;
CREATE POLICY "bookings_select_policy" ON public.bookings
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT user_id FROM public.host_profiles WHERE id = host_id)
    );

DROP POLICY IF EXISTS "bookings_insert_policy" ON public.bookings;
CREATE POLICY "bookings_insert_policy" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_update_policy" ON public.bookings;
CREATE POLICY "bookings_update_policy" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT user_id FROM public.host_profiles WHERE id = host_id)
    );

-- 11. Create test data for the authenticated user
DO $$
DECLARE
    test_user_id UUID;
    test_host_id UUID;
    test_exp_id UUID;
BEGIN
    -- Get current authenticated user (if any)
    test_user_id := auth.uid();
    
    -- If no authenticated user, use a specific test ID
    IF test_user_id IS NULL THEN
        test_user_id := '6304ab11-3657-4e1c-b119-ab14115fbec1';
    END IF;
    
    -- Insert host profile for the test user
    INSERT INTO public.host_profiles (
        id, user_id, name, business_name, contact_name, email, phone, 
        business_type, location, description, years_experience, host_type
    ) VALUES (
        test_user_id, test_user_id, 'Test Business', 'Sea Adventures Ltd', 
        'John Captain', 'annals-63.balsams@icloud.com', '+1-555-0123',
        'boat_tours', 'Mediterranean Coast', 
        'Professional boat tour operator with 10+ years of experience',
        10, 'captain'
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        business_name = EXCLUDED.business_name,
        updated_at = NOW();
    
    test_host_id := test_user_id;
    
    -- Insert host business settings
    INSERT INTO public.host_business_settings (
        host_profile_id, onboarding_completed, marketplace_enabled
    ) VALUES (
        test_host_id, true, true
    ) ON CONFLICT (host_profile_id) DO UPDATE SET
        onboarding_completed = EXCLUDED.onboarding_completed,
        marketplace_enabled = EXCLUDED.marketplace_enabled;
    
    -- Insert a test experience
    INSERT INTO public.experiences (
        id, host_id, title, description, location, activity_type, 
        duration_hours, max_guests, min_guests, price_per_person, 
        difficulty_level, is_active
    ) VALUES (
        gen_random_uuid(), test_host_id, 'Sunset Sailing Adventure', 
        'Experience the magic of Mediterranean sunset aboard our luxury sailboat',
        'Marina Bay', 'sailing', 3, 8, 2, 89.00, 'beginner', true
    ) ON CONFLICT DO NOTHING;
    
    -- Insert host availability for the next 7 days
    FOR i IN 0..6 LOOP
        INSERT INTO public.host_availability (
            host_profile_id, date, start_time, end_time, 
            available_capacity, max_capacity
        ) VALUES (
            test_host_id, 
            CURRENT_DATE + i,
            '09:00', '18:00',
            6, 8
        ) ON CONFLICT (host_profile_id, date, start_time) DO NOTHING;
    END LOOP;
    
END $$;

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON public.bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_experience_id ON public.bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON public.experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_host_availability_host_profile_id ON public.host_availability(host_profile_id);
CREATE INDEX IF NOT EXISTS idx_host_availability_date ON public.host_availability(date);

-- Success message
SELECT 'Database schema fix completed successfully!' as status;
