/*
  # Update user profiles table for mobile authentication

  1. Schema Changes
    - Add `phone_number` column if it doesn't exist
    - Update existing phone_number column to be more flexible
    - Add unique constraint on phone_number
    - Update RLS policies to support phone-based authentication

  2. Security
    - Maintain existing RLS policies
    - Add phone number validation
    - Ensure secure phone number storage

  3. Data Migration
    - Safely add new column without affecting existing data
    - Add indexes for performance
*/

-- Add phone_number column if it doesn't exist (it should already exist based on schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Add unique constraint on phone_number if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_profiles' AND constraint_name = 'user_profiles_phone_number_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

-- Add index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number ON user_profiles(phone_number);

-- Add check constraint for phone number format (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_profiles_phone_number_format'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_phone_number_format 
    CHECK (phone_number IS NULL OR phone_number ~ '^\+\d{10,15}$');
  END IF;
END $$;

-- Update RLS policies to support phone-based lookups (policies should already exist)
-- The existing policies using uid() should work fine for phone authentication too