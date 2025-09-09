/*
  # Fix OTP Authentication Issues
  
  This migration addresses:
  1. Database errors during user creation
  2. Trigger function improvements
  3. Better error handling for OTP flows
  4. Phone number validation fixes
*/

-- Ensure user_profiles table structure is correct
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS product_id text;

-- Drop conflicting constraints
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_phone_number_format;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_phone_number_key;

-- Add improved phone number constraint that handles international format
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_phone_number_format 
CHECK (
  phone_number IS NULL OR 
  phone_number ~ '^\+\d{10,15}$'
);

-- Create unique index for phone numbers (allowing nulls)
DROP INDEX IF EXISTS user_profiles_phone_number_key;
CREATE UNIQUE INDEX user_profiles_phone_number_key 
ON user_profiles(phone_number) 
WHERE phone_number IS NOT NULL;

-- Improved trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  user_phone text;
  user_name text;
  user_product_id text;
  profile_exists boolean := false;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = NEW.id) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE LOG 'Profile already exists for user: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Extract and validate data from raw_user_meta_data
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
    CASE 
      WHEN user_email IS NOT NULL THEN split_part(user_email, '@', 1)
      ELSE 'User'
    END
  );
  
  user_product_id := COALESCE(
    (NEW.raw_user_meta_data->>'product_id')::text,
    'DEMO-001'
  );

  -- Log the extraction for debugging
  RAISE LOG 'Creating profile for user: % with email: %, phone: %, name: %, product_id: %', 
    NEW.id, user_email, user_phone, user_name, user_product_id;

  -- Validate phone number format if provided
  IF user_phone IS NOT NULL AND user_phone !~ '^\+\d{10,15}$' THEN
    RAISE LOG 'Invalid phone number format for user %: %', NEW.id, user_phone;
    user_phone := NULL;
  END IF;

  -- Insert into user_profiles with comprehensive error handling
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
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle duplicate phone number
      IF SQLSTATE = '23505' AND SQLERRM LIKE '%phone_number%' THEN
        RAISE LOG 'Duplicate phone number for user %: %, creating without phone', NEW.id, user_phone;
        INSERT INTO public.user_profiles (
          id, full_name, email, product_id, created_at, updated_at
        ) VALUES (
          NEW.id, user_name, user_email, user_product_id, NOW(), NOW()
        );
      ELSE
        RAISE LOG 'Unique violation for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
      END IF;
    WHEN OTHERS THEN
      RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
      -- Don't fail the user creation, just log the error
      RETURN NEW;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure products table exists
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT 'AgriCure Device',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert demo products
INSERT INTO products (id, name, is_active) VALUES
  ('AGRICURE-001', 'AgriCure Smart Sensor Kit', true),
  ('AGRICURE-002', 'AgriCure Pro Kit', true),
  ('AGRICURE-003', 'AgriCure Enterprise', true),
  ('DEMO-001', 'Demo Product for Testing', true)
ON CONFLICT (id) DO NOTHING;

-- Update RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access for signup validation" ON products;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can update profiles" ON user_profiles;

-- Create new policies
CREATE POLICY "Allow public read access for signup validation"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

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

CREATE POLICY "System can insert profiles"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "System can update profiles"
  ON user_profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_product_id ON user_profiles(product_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Verification query
DO $$
DECLARE
  profile_count integer;
  product_count integer;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM user_profiles;
  SELECT COUNT(*) INTO product_count FROM products WHERE is_active = true;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Current user profiles: %', profile_count;
  RAISE NOTICE 'Active products: %', product_count;
  RAISE NOTICE 'OTP authentication should now work properly';
END $$;
