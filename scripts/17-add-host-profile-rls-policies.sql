-- Enable Row Level Security for the host_profiles table if not already enabled
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict or need to be replaced
DROP POLICY IF EXISTS "Allow authenticated users to insert their own host profile" ON public.host_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view their own host profile" ON public.host_profiles;

-- Policy to allow authenticated users to insert their own host profile
CREATE POLICY "Allow authenticated users to insert their own host profile"
ON public.host_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to view their own host profile
CREATE POLICY "Allow authenticated users to view their own host profile"
ON public.host_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);
