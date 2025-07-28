
-- Fix Business Functionality Database Issues
BEGIN;

-- 1. Ensure user_profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Ensure host_profiles table exists
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
    host_type TEXT DEFAULT 'host',
    languages_spoken TEXT[] DEFAULT '{}',
    business_registration_id TEXT,
    insurance_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Fix bookings table foreign keys
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE;

-- 4. Fix experiences table
ALTER TABLE public.experiences
DROP CONSTRAINT IF EXISTS experiences_host_id_fkey;

ALTER TABLE public.experiences
ADD CONSTRAINT experiences_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.host_profiles(id) ON DELETE CASCADE;

-- 5. Create test host profile if none exists
DO $$
DECLARE
    test_user_id UUID;
    test_host_id UUID;
BEGIN
    -- Get the first authenticated user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insert user profile if not exists
        INSERT INTO public.user_profiles (
            user_id, first_name, last_name, email, role
        ) VALUES (
            test_user_id, 'Test', 'Business', 'test@business.com', 'business'
        ) ON CONFLICT (user_id) DO NOTHING;
        
        -- Insert host profile if not exists
        INSERT INTO public.host_profiles (
            user_id, name, business_name, email, host_type
        ) VALUES (
            test_user_id, 'Test Business Host', 'Test Adventure Co', 'test@business.com', 'captain'
        ) ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            business_name = EXCLUDED.business_name;
    END IF;
END $$;

-- 6. Enable RLS and create policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Host profiles policies  
DROP POLICY IF EXISTS "Hosts can manage own profile" ON public.host_profiles;
CREATE POLICY "Hosts can manage own profile" ON public.host_profiles
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view host profiles" ON public.host_profiles;
CREATE POLICY "Public can view host profiles" ON public.host_profiles
    FOR SELECT USING (true);

COMMIT;
