import { supabase } from '@/lib/supabaseClient';
import { normalizePhoneNumber, isEmail, isPhoneNumber } from '@/utils/phone';
import type { Profile } from '@/lib/supabaseClient';

export interface SignUpWithEmailData {
  email: string;
  password: string;
  fullName: string;
  mobile: string;
  productId: string;
}

export interface SignUpWithPhoneData {
  phone: string;
  password: string;
  fullName: string;
  email: string;
  productId: string;
}

export interface VerifyOtpData {
  type: 'email' | 'sms';
  email?: string;
  phone?: string;
  token: string;
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface ResendOtpData {
  type: 'email' | 'sms';
  email?: string;
  phone?: string;
}

export class AuthApiService {
  /**
   * Sign up with email verification
   */
  static async signUpWithEmail(data: SignUpWithEmailData) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            mobile: data.mobile,
            product_id: data.productId,
          }
        }
      });

      if (error) throw error;

      return { data: authData, error: null };
    } catch (error) {
      console.error('Email signup error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign up with SMS verification
   */
  static async signUpWithPhone(data: SignUpWithPhoneData) {
    try {
      const phoneResult = normalizePhoneNumber(data.phone);
      if (!phoneResult.isValid) {
        throw new Error(phoneResult.error || 'Invalid phone number format');
      }

      const { data: authData, error } = await supabase.auth.signUp({
        phone: phoneResult.formatted!,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            email: data.email,
            product_id: data.productId,
          }
        }
      });

      if (error) throw error;

      return { data: authData, error: null };
    } catch (error) {
      console.error('Phone signup error:', error);
      return { data: null, error };
    }
  }

  /**
   * Verify OTP code using Supabase Auth
   */
  static async verifyOtpCode(data: VerifyOtpData) {
    try {
      const verifyData: any = {
        type: data.type === 'email' ? 'email' : 'sms',
        token: data.token,
      };

      if (data.type === 'email' && data.email) {
        verifyData.email = data.email;
      } else if (data.type === 'sms' && data.phone) {
        const phoneResult = normalizePhoneNumber(data.phone);
        if (!phoneResult.isValid) {
          throw new Error(phoneResult.error || 'Invalid phone number format');
        }
        verifyData.phone = phoneResult.formatted;
      }

      const { data: authData, error } = await supabase.auth.verifyOtp(verifyData);

      if (error) throw error;

      // After successful verification, ensure profile exists
      if (authData.user) {
        await this.ensureProfile();
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { data: null, error };
    }
  }

  /**
   * Login with email or phone
   */
  static async loginWithIdentifier(data: LoginData) {
    try {
      let authData;
      let error;

      if (isEmail(data.identifier)) {
        // Login with email
        const result = await supabase.auth.signInWithPassword({
          email: data.identifier,
          password: data.password,
        });
        authData = result.data;
        error = result.error;
      } else if (isPhoneNumber(data.identifier)) {
        // Login with phone
        const phoneResult = normalizePhoneNumber(data.identifier);
        if (!phoneResult.isValid) {
          throw new Error(phoneResult.error || 'Invalid phone number format');
        }

        const result = await supabase.auth.signInWithPassword({
          phone: phoneResult.formatted!,
          password: data.password,
        });
        authData = result.data;
        error = result.error;
      } else {
        throw new Error('Please enter a valid email address or phone number');
      }

      if (error) throw error;

      return { data: authData, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  }

  /**
   * Resend OTP using Supabase Auth
   */
  static async resendOtp(data: ResendOtpData) {
    try {
      const resendData: any = {
        type: data.type,
      };

      if (data.type === 'email' && data.email) {
        resendData.email = data.email;
      } else if (data.type === 'sms' && data.phone) {
        const phoneResult = normalizePhoneNumber(data.phone);
        if (!phoneResult.isValid) {
          throw new Error(phoneResult.error || 'Invalid phone number format');
        }
        resendData.phone = phoneResult.formatted;
      }

      const { error } = await supabase.auth.resend(resendData);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { error };
    }
  }

  /**
   * Ensure user profile exists in profiles table
   */
  static async ensureProfile(): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        throw fetchError;
      }

      if (existingProfile) {
        return { data: existingProfile, error: null };
      }

      // Create new profile from user metadata
      const metadata = user.user_metadata || {};
      const profileData = {
        id: user.id,
        product_id: metadata.product_id || '',
        full_name: metadata.full_name || '',
        mobile: metadata.mobile || user.phone || '',
        email: metadata.email || user.email || '',
      };

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (insertError) throw insertError;

      return { data: newProfile, error: null };
    } catch (error) {
      console.error('Ensure profile error:', error);
      return { data: null, error };
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentProfile(): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: userError || new Error('No authenticated user') };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { data: profile, error };
    } catch (error) {
      console.error('Get profile error:', error);
      return { data: null, error };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign out user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  /**
   * Get current user session
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  }

  /**
   * Check if user is verified (email or phone confirmed)
   */
  static isUserVerified(user: any): boolean {
    return !!(user?.email_confirmed_at || user?.phone_confirmed_at);
  }
}