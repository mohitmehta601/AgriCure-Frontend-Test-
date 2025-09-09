# URGENT: Database Migration Required for OTP Fix

## Issues Fixed

1. **Database error saving new user** - Fixed trigger function and user_profiles table structure
2. **Invalid phone number format** - Updated phone number validation and formatting
3. **OTP verification type errors** - Fixed TypeScript types for Supabase OTP verification

## Steps to Apply the Fix

### 1. Apply Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the SQL from `supabase/migrations/20250909120000_fix_otp_auth.sql`
4. Run the SQL migration

### 2. Verify Supabase Configuration

Make sure your Supabase project has:

- **Email Auth** enabled (Authentication > Settings > Auth providers)
- **Phone Auth** enabled (Authentication > Settings > Auth providers)
- **SMS Provider** configured if you want phone OTP to work
- **Signup** enabled (Authentication > Settings > Allow new users to sign up)

### 3. Test the OTP Flow

After applying the migration:

1. Try email OTP first - this should work immediately
2. For phone OTP, ensure SMS provider is configured in Supabase
3. Use phone numbers in format: `+917877059117` or `7877059117`

## Files Modified

- `src/services/otpService.ts` - Fixed phone validation and OTP verification
- `src/components/OTPVerification.tsx` - Improved phone number formatting
- `supabase/migrations/20250909120000_fix_otp_auth.sql` - Database structure fixes

## Expected Behavior After Fix

- Email OTP should work without "Database error saving new user"
- Phone OTP should accept valid Indian mobile numbers
- Better error messages for network issues
- Proper user profile creation after OTP verification

## If Issues Persist

1. Check Supabase logs in the dashboard
2. Verify environment variables in `.env` file
3. Ensure all policies and triggers are properly applied
4. Check browser console for detailed error messages
