# 🔐 Supabase Auth Integration

This project uses **Supabase Auth exclusively** for all authentication and verification flows. No custom OTP services or external SMS gateways are used.

## 🚀 Quick Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy the content from supabase/migrations/create_profiles_table.sql
```

### 3. Supabase Auth Configuration

In your Supabase Dashboard:

#### Email Provider
1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Turn on **Confirm email** (this enables OTP/confirmation managed by Supabase)
4. Configure email templates if needed

#### Phone Provider
1. Enable **Phone** provider
2. Configure **Supabase-managed SMS** (no custom provider needed)
3. Ensure SMS is enabled for your region

#### Security Settings
1. Enable **Row Level Security (RLS)** on all tables
2. The migration automatically creates the necessary RLS policies

## 🔄 Authentication Flows

### Signup Flow
1. User fills signup form (Product ID, Full Name, Mobile, Email, Password)
2. User chooses verification method: **Email** or **SMS**
3. Supabase sends OTP via chosen method
4. User enters 6-digit OTP
5. On success: profile is created and user is redirected to dashboard

### Login Flow
1. User enters email or mobile number + password
2. System auto-detects identifier type and calls appropriate Supabase method
3. If unverified: shows resend OTP options
4. On success: user is redirected to dashboard

### OTP Verification
- 6-digit input with auto-focus and paste support
- Resend functionality with 60s cooldown
- Maximum 3 resend attempts per session
- All OTP handling via `supabase.auth.verifyOtp()`

## 🛡️ Security Features

- **Supabase Auth Only**: All verification uses `supabase.auth.*` methods
- **Strong Password Policy**: Uppercase, lowercase, number, special character required
- **Phone Validation**: E.164 format with India-friendly normalization
- **RLS Policies**: Users can only access their own profile data
- **Client-side Throttling**: Resend limits and cooldowns
- **Input Validation**: Zod schemas for all form data

## 📱 Supported Formats

### Phone Numbers
- `+919876543210` (E.164 format)
- `9876543210` (auto-adds +91)
- `09876543210` (removes leading 0, adds +91)

### Email
- Standard RFC-compliant email validation

### Product ID
- 3-32 characters
- Letters, numbers, underscores, hyphens only

## 🔧 API Methods

All authentication methods are in `src/services/authApi.ts`:

- `signUpWithEmail()` - Email signup with Supabase
- `signUpWithPhone()` - SMS signup with Supabase  
- `verifyOtpCode()` - OTP verification via Supabase
- `loginWithIdentifier()` - Auto-detect email/phone login
- `resendOtp()` - Resend verification via Supabase
- `ensureProfile()` - Create/update user profile

## 🎨 Components

- `src/components/auth/Signup.tsx` - Signup form with verification choice
- `src/components/auth/Login.tsx` - Login with unverified user handling
- `src/components/auth/OtpVerify.tsx` - 6-digit OTP input with resend
- `src/components/auth/AuthLayout.tsx` - Main auth flow coordinator
- `src/components/auth/ProtectedRoute.tsx` - Route protection wrapper
- `src/components/auth/PublicRoute.tsx` - Public route wrapper

## 🔍 Validation

- `src/utils/validators.ts` - Zod schemas for all forms
- `src/utils/phone.ts` - Phone number normalization utilities

## 🚦 Usage

```tsx
// Protect a route
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Public route (redirects if authenticated)
<PublicRoute>
  <AuthLayout />
</PublicRoute>

// Use auth state
const { user, profile, isAuthenticated, signOut } = useAuth();
```

## ⚠️ Important Notes

1. **Supabase Only**: No external SMS services or custom OTP implementations
2. **Email Confirmation**: Must be enabled in Supabase Auth settings
3. **SMS Configuration**: Ensure SMS is enabled for your target regions
4. **RLS Required**: Database policies enforce user data isolation
5. **Phone Format**: All phones stored in E.164 format (+country_code_number)

The system is production-ready and handles all edge cases including unverified users, resend limits, and proper error handling.