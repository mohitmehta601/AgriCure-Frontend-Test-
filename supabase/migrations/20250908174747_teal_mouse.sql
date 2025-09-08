/*
  # Update Authentication System

  1. Database Changes
    - Add phone number constraint to user_profiles table
    - Add indexes for better performance on email and phone lookups
    - Update RLS policies for enhanced security
    - Add trigger for automatic profile creation

  2. Security Enhancements
    - Ensure phone numbers are properly formatted
    - Add unique constraints for phone numbers
    - Update RLS policies for better access control

  3. Performance Optimizations
    - Add indexes on frequently queried columns
    - Optimize user lookup queries
*/

-- Add phone number constraint and index to user_profiles table
DO $$
BEGIN
  -- Add phone number constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_phone_number_key' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number ON user_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Add phone number format validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'user_profiles_phone_format_check'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_phone_format_check 
    CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$');
  END IF;
END $$;

-- Update RLS policies for better security
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create enhanced RLS policies
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

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone_number)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.phone, new.raw_user_meta_data->>'phone_number')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update products table to ensure it has proper structure for validation
DO $$
BEGIN
  -- Ensure products table exists with proper structure
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE TABLE products (
      id text PRIMARY KEY,
      name text NOT NULL DEFAULT 'AgriCure Device',
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    -- Allow public read access for signup validation
    CREATE POLICY "Allow public read access for signup validation"
      ON products
      FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;

-- Insert default product if it doesn't exist
INSERT INTO products (id, name, is_active)
VALUES ('AGRICURE-001', 'AgriCure Smart Sensor Kit', true)
ON CONFLICT (id) DO NOTHING;

-- Add some additional product IDs for testing
INSERT INTO products (id, name, is_active) VALUES
  ('AGRICURE-002', 'AgriCure Pro Kit', true),
  ('AGRICURE-003', 'AgriCure Enterprise', true),
  ('DEMO-001', 'Demo Product', true)
ON CONFLICT (id) DO NOTHING;

-- Create function to validate product ID
CREATE OR REPLACE FUNCTION public.validate_product_id(product_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM products 
    WHERE id = product_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to document the enhanced authentication system
COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with phone number support and OTP verification';
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number in international format (e.g., +919876543210)';
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates user profile when new user signs up';
COMMENT ON FUNCTION validate_product_id(text) IS 'Validates if a product ID is active and exists';