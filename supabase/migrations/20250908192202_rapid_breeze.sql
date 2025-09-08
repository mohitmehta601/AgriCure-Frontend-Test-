/*
  # Fix All Authentication and Database Issues

  1. Database Schema Updates
    - Add missing product_id column to user_profiles
    - Fix phone number constraints and validation
    - Add proper indexes for performance
    - Update RLS policies for better security

  2. Authentication Functions
    - Fix handle_new_user trigger function
    - Add proper error handling
    - Support both email and phone authentication
    - Handle product_id from user metadata

  3. Products Table
    - Ensure products table exists with proper structure
    - Add sample product IDs for testing
    - Set up proper RLS policies

  4. Security Enhancements
    - Update RLS policies for user_profiles
    - Add proper constraints and validations
    - Ensure data integrity
*/

-- Drop existing constraints that might conflict
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_phone_format_check' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_phone_format_check;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_phone_number_format' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_phone_number_format;
  END IF;
END $$;

-- Add product_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN product_id text;
  END IF;
END $$;

-- Update user_profiles table structure
ALTER TABLE user_profiles 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN full_name SET NOT NULL;

-- Add proper phone number constraint
ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_phone_number_format 
  CHECK (
    phone_number IS NULL OR 
    phone_number ~ '^\+\d{10,15}$'
  );

-- Add unique constraint on phone_number if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_phone_number_key' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number ON user_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_product_id ON user_profiles(product_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Ensure products table exists with proper structure
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT 'AgriCure Device',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active products (for signup validation)
DROP POLICY IF EXISTS "Allow public read access for signup validation" ON products;
CREATE POLICY "Allow public read access for signup validation"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Insert sample products if they don't exist
INSERT INTO products (id, name, is_active) VALUES
  ('AGRICURE-001', 'AgriCure Smart Sensor Kit', true),
  ('AGRICURE-002', 'AgriCure Pro Kit', true),
  ('AGRICURE-003', 'AgriCure Enterprise', true),
  ('DEMO-001', 'Demo Product for Testing', true)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate the handle_new_user function with better error handling
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_name text;
  user_phone text;
  user_product_id text;
BEGIN
  -- Extract data from user metadata or direct fields
  user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User');
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone_number', NEW.raw_user_meta_data->>'phone');
  user_product_id := NEW.raw_user_meta_data->>'product_id';

  -- Ensure we have required data
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Email is required for user profile creation';
  END IF;

  -- Insert user profile with error handling
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      full_name,
      email,
      phone_number,
      product_id,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_name,
      user_email,
      user_phone,
      user_product_id,
      now(),
      now()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Update existing profile instead
      UPDATE public.user_profiles SET
        full_name = COALESCE(user_name, full_name),
        email = COALESCE(user_email, email),
        phone_number = COALESCE(user_phone, phone_number),
        product_id = COALESCE(user_product_id, product_id),
        updated_at = now()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the auth process
      RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add policy for system to insert profiles (for triggers)
CREATE POLICY "System can insert profiles"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add comment to the table
COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with phone number support and OTP verification';
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number in international format (e.g., +919876543210)';