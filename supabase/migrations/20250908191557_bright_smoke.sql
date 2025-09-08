/*
  # Add product_id column to user_profiles table

  1. Schema Changes
    - Add `product_id` column to `user_profiles` table
    - Make it nullable to prevent immediate errors
    - Add index for performance

  2. Trigger Updates
    - Update `handle_new_user` function to handle product_id from metadata
    - Ensure proper data extraction from raw_user_meta_data

  3. Security
    - Update RLS policies if needed
    - Maintain existing constraints
*/

-- Add product_id column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS product_id TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_product_id 
ON public.user_profiles (product_id);

-- Update the handle_new_user function to include product_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    email,
    phone_number,
    product_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone_number'),
    NEW.raw_user_meta_data->>'product_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;