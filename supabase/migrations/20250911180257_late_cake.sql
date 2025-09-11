/*
  # Create profiles table with proper RLS and constraints

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
    - Add constraints for data validation

  3. Indexes
    - Add indexes for email, mobile, and product_id for performance
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

-- Add constraints for data validation
ALTER TABLE profiles 
ADD CONSTRAINT profiles_product_id_format 
CHECK (product_id ~ '^[A-Za-z0-9_-]{3,32}$');

ALTER TABLE profiles 
ADD CONSTRAINT profiles_full_name_length 
CHECK (length(full_name) >= 2 AND length(full_name) <= 60);

ALTER TABLE profiles 
ADD CONSTRAINT profiles_mobile_format 
CHECK (mobile ~ '^\+[1-9]\d{1,14}$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_product_id ON profiles(product_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);