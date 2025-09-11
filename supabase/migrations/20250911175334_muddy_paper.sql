/*
  # Create profiles table with Supabase Auth integration

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `product_id` (text, required)
      - `full_name` (text, required)
      - `mobile` (text, unique, required)
      - `email` (text, unique, required)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to read, update, and insert their own profile
    - Foreign key constraint to auth.users with cascade delete

  3. Indexes
    - Unique indexes on mobile and email for fast lookups
    - Index on product_id for filtering
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  full_name text NOT NULL,
  mobile text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_product_id ON profiles(product_id);

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT profiles_mobile_format 
CHECK (mobile ~ '^\+[1-9]\d{1,14}$');

ALTER TABLE profiles 
ADD CONSTRAINT profiles_product_id_format 
CHECK (product_id ~ '^[A-Za-z0-9_-]{3,32}$');

ALTER TABLE profiles 
ADD CONSTRAINT profiles_full_name_length 
CHECK (length(full_name) >= 2 AND length(full_name) <= 60);