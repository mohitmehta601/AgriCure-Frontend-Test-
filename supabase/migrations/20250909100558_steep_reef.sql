/*
  # Complete OTP Authentication Fix

  1. Database Schema Updates
    - Ensure all required columns exist
    - Fix constraints and triggers
    - Add proper indexes

  2. Authentication Functions
    - Enhanced user creation trigger
    - Better error handling
    - Support for both email and phone auth

  3. Security Policies
    - Updated RLS policies
    - Proper access control
    - Service role permissions
*/

-- Ensure user_profiles table has all required columns
DO $$
BEGIN
  -- Add product_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN product_id text;
  END IF;
  
  -- Add phone_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Drop existing constraints that might conflict
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_phone_number_format;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_phone_number_key;

-- Add proper phone number constraint
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_phone_number_format 
CHECK (
  phone_number IS NULL OR 
  phone_number ~ '^\+\d{10,15}$'
);

-- Add unique constraint on phone_number (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_phone_number_key 
ON user_profiles(phone_number) 
WHERE phone_number IS NOT NULL;

-- Add index on product_id for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_product_id ON user_profiles(product_id);

-- Enhanced trigger function for new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  user_phone text;
  user_name text;
  user_product_id text;
BEGIN
  -- Extract data from raw_user_meta_data
  user_email := COALESCE(
    NEW.email,
    (NEW.raw_user_meta_data->>'email')::text
  );
  
  user_phone := COALESCE(
    NEW.phone,
    (NEW.raw_user_meta_data->>'phone')::text,
    (NEW.raw_user_meta_data->>'phone_number')::text
  );
  
  user_name := COALESCE(
    (NEW.raw_user_meta_data->>'full_name')::text,
    (NEW.raw_user_meta_data->>'name')::text,
    split_part(user_email, '@', 1)
  );
  
  user_product_id := (NEW.raw_user_meta_data->>'product_id')::text;

  -- Log the extraction for debugging
  RAISE LOG 'Creating profile for user: % with email: %, phone: %, name: %, product_id: %', 
    NEW.id, user_email, user_phone, user_name, user_product_id;

  -- Insert into user_profiles with conflict handling
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
    COALESCE(user_name, 'User'),
    user_email,
    user_phone,
    user_product_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    email = COALESCE(EXCLUDED.email, user_profiles.email),
    phone_number = COALESCE(EXCLUDED.phone_number, user_profiles.phone_number),
    product_id = COALESCE(EXCLUDED.product_id, user_profiles.product_id),
    updated_at = NOW();

  RAISE LOG 'Profile created/updated successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure products table exists with sample data
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT 'AgriCure Device',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert sample products if they don't exist
INSERT INTO products (id, name, is_active) VALUES
  ('AGRICURE-001', 'AgriCure Smart Sensor Kit', true),
  ('AGRICURE-002', 'AgriCure Pro Kit', true),
  ('AGRICURE-003', 'AgriCure Enterprise', true),
  ('DEMO-001', 'Demo Product for Testing', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access for signup validation
DROP POLICY IF EXISTS "Allow public read access for signup validation" ON products;
CREATE POLICY "Allow public read access for signup validation"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Update user_profiles RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for triggers)
CREATE POLICY "System can insert profiles"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update profiles (for triggers)
CREATE POLICY "System can update profiles"
  ON user_profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Products table has % active products', (SELECT COUNT(*) FROM products WHERE is_active = true);
  RAISE NOTICE 'User profiles table is ready for OTP authentication';
END $$;