/*
  # Create profiles table with proper auth integration

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `product_id` (text, required)
      - `full_name` (text, required, 2-60 chars)
      - `mobile` (text, unique, E.164 format)
      - `email` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to manage their own data
    - Add service role policy for system operations

  3. Trigger Function
    - Create `handle_new_user` function with SECURITY DEFINER
    - Automatically create profile when user signs up
    - Handle the user metadata from auth.signUp
*/

-- Create the profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  full_name text NOT NULL,
  mobile text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add constraints for data validation
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_product_id_format 
CHECK (product_id ~ '^[A-Za-z0-9_-]{3,32}$');

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_full_name_length 
CHECK (length(full_name) >= 2 AND length(full_name) <= 60);

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_mobile_format 
CHECK (mobile ~ '^\+[1-9]\d{1,14}$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_product_id ON profiles(product_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service role policy for system operations
CREATE POLICY "System can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create trigger function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile for new user using metadata from auth.signUp
  INSERT INTO public.profiles (
    id,
    product_id,
    full_name,
    mobile,
    email
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'product_id', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'email', NEW.email, '')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();