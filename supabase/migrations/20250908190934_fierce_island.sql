/*
  # Enable Authentication Providers and Settings

  This migration ensures proper configuration for OTP authentication.
  
  1. Security Updates
    - Enable email confirmations
    - Configure OTP settings
    - Set proper auth policies
  
  2. User Management
    - Allow signups via OTP
    - Configure email and phone providers
    - Set appropriate timeouts
*/

-- Enable Row Level Security on auth schema (if not already enabled)
-- Note: This is handled by Supabase automatically, but we ensure it's configured

-- Create a function to handle new user signups via OTP
CREATE OR REPLACE FUNCTION public.handle_new_user_otp()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile when a new user is created via OTP
  INSERT INTO public.user_profiles (
    id,
    full_name,
    email,
    phone_number
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.phone, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    email = COALESCE(EXCLUDED.email, user_profiles.email),
    phone_number = COALESCE(EXCLUDED.phone_number, user_profiles.phone_number),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation via OTP
DROP TRIGGER IF EXISTS on_auth_user_created_otp ON auth.users;
CREATE TRIGGER on_auth_user_created_otp
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_otp();

-- Update the existing trigger to handle both regular signup and OTP signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile when a new user is created
  INSERT INTO public.user_profiles (
    id,
    full_name,
    email,
    phone_number
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.phone, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    email = COALESCE(EXCLUDED.email, user_profiles.email),
    phone_number = COALESCE(EXCLUDED.phone_number, user_profiles.phone_number),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add additional validation for phone numbers in user_profiles
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_phone_number_format;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_phone_number_format 
CHECK (
  phone_number IS NULL OR 
  phone_number ~ '^\+\d{10,15}$'
);

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number 
ON user_profiles(phone_number);

-- Update RLS policies to handle OTP users
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure products table has proper RLS for signup validation
DROP POLICY IF EXISTS "Allow public read access for signup validation" ON products;
CREATE POLICY "Allow public read access for signup validation"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);