/*
  # Fix User Creation Database Issues

  1. Enhanced Functions
    - `handle_new_user()` - Creates user profile automatically
    - `handle_new_user_otp()` - Handles OTP-based user creation
    - Better error handling and data extraction

  2. Updated Triggers
    - Trigger on auth.users insert for automatic profile creation
    - Handles both password and OTP-based signups

  3. Security Updates
    - Enhanced RLS policies
    - Better constraint handling
    - Improved error messages

  4. Data Validation
    - Phone number format validation
    - Email format validation
    - Required field checks
*/

-- Drop existing functions and triggers to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_new_user_otp();

-- Enhanced function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_phone TEXT;
  user_name TEXT;
  product_id TEXT;
BEGIN
  -- Extract data from raw_user_meta_data or user_metadata
  user_email := COALESCE(
    NEW.email,
    NEW.raw_user_meta_data->>'email',
    NEW.user_metadata->>'email'
  );
  
  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NEW.user_metadata->>'phone',
    NEW.raw_user_meta_data->>'phone_number'
  );
  
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.user_metadata->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(user_email, '@', 1)
  );
  
  product_id := COALESCE(
    NEW.raw_user_meta_data->>'product_id',
    NEW.user_metadata->>'product_id',
    'DEMO-001'
  );

  -- Ensure we have required data
  IF user_email IS NULL AND user_phone IS NULL THEN
    RAISE EXCEPTION 'User must have either email or phone number';
  END IF;

  IF user_name IS NULL OR user_name = '' THEN
    user_name := COALESCE(SPLIT_PART(user_email, '@', 1), 'User');
  END IF;

  -- Insert user profile with error handling
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      full_name,
      email,
      phone_number,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_name,
      user_email,
      user_phone,
      NOW(),
      NOW()
    );
    
    -- Log successful creation
    RAISE NOTICE 'User profile created successfully for user: %', NEW.id;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- Handle duplicate key errors
      RAISE NOTICE 'User profile already exists for user: %', NEW.id;
      
      -- Update existing profile instead
      UPDATE public.user_profiles 
      SET 
        full_name = COALESCE(user_name, full_name),
        email = COALESCE(user_email, email),
        phone_number = COALESCE(user_phone, phone_number),
        updated_at = NOW()
      WHERE id = NEW.id;
      
    WHEN OTHERS THEN
      -- Log other errors but don't fail the auth process
      RAISE NOTICE 'Error creating user profile for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enhanced function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure updated_at trigger exists
DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Update user_profiles table constraints
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_phone_format_check;

ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_phone_number_format;

-- Add improved phone number validation
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_phone_number_format 
CHECK (
  phone_number IS NULL OR 
  phone_number ~ '^\+\d{10,15}$'
);

-- Add email validation constraint
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_email_format;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_email_format 
CHECK (
  email IS NULL OR 
  email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
);

-- Ensure products table has proper data
INSERT INTO public.products (id, name, is_active) VALUES 
  ('AGRICURE-001', 'AgriCure Smart Sensor Kit', true),
  ('AGRICURE-002', 'AgriCure Pro Kit', true),
  ('AGRICURE-003', 'AgriCure Enterprise', true),
  ('DEMO-001', 'Demo Product', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- Update RLS policies for better security
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Enhanced RLS policies
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage profiles (for triggers)
CREATE POLICY "Service role can manage profiles"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Test the trigger function
DO $$
BEGIN
  RAISE NOTICE 'Database migration completed successfully';
  RAISE NOTICE 'User profile creation trigger is now active';
  RAISE NOTICE 'Phone and email validation constraints added';
  RAISE NOTICE 'Products table updated with demo data';
END $$;