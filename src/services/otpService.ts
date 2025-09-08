import { supabase } from './supabaseClient';

export interface OTPVerificationData {
  type: 'email' | 'phone';
  token: string;
  phone?: string;
  email?: string;
}

export interface SendOTPData {
  type: 'email' | 'phone';
  phone?: string;
  email?: string;
}

export const otpService = {
  // Send OTP via email for signup (creates new user)
  async sendEmailOTPForSignup(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true, // Allow new user creation
          data: {
            email_confirm: true,
          }
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Email OTP signup error:', error);
      return { data: null, error };
    }
  },

  // Send OTP via phone for signup (creates new user)
  async sendPhoneOTPForSignup(phone: string) {
    try {
      // Ensure phone number is in international format
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true, // Allow new user creation
          data: {
            phone_confirm: true,
          }
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Phone OTP signup error:', error);
      return { data: null, error };
    }
  },

  // Send OTP via email for existing users (login)
  async sendEmailOTPForLogin(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Only existing users
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Email OTP login error:', error);
      return { data: null, error };
    }
  },

  // Send OTP via phone for existing users (login)
  async sendPhoneOTPForLogin(phone: string) {
    try {
      // Ensure phone number is in international format
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: false, // Only existing users
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Phone OTP login error:', error);
      return { data: null, error };
    }
  },

  // Verify OTP for both signup and login
  async verifyOTP(verificationData: OTPVerificationData) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: verificationData.type === 'email' ? 'email' : 'sms',
        token: verificationData.token,
        email: verificationData.email,
        phone: verificationData.phone,
      });

      return { data, error };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { data: null, error };
    }
  },

  // Resend OTP for signup
  async resendOTPForSignup(data: SendOTPData) {
    if (data.type === 'email' && data.email) {
      return this.sendEmailOTPForSignup(data.email);
    } else if (data.type === 'phone' && data.phone) {
      return this.sendPhoneOTPForSignup(data.phone);
    }
    return { data: null, error: new Error('Invalid OTP resend data') };
  },

  // Resend OTP for login
  async resendOTPForLogin(data: SendOTPData) {
    if (data.type === 'email' && data.email) {
      return this.sendEmailOTPForLogin(data.email);
    } else if (data.type === 'phone' && data.phone) {
      return this.sendPhoneOTPForLogin(data.phone);
    }
    return { data: null, error: new Error('Invalid OTP resend data') };
  },

  // Format phone number to international format
  formatPhoneNumber(phone: string, countryCode: string = '+91'): string {
    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If it already starts with country code, return as is
    if (phone.startsWith(countryCode)) {
      return phone;
    }
    
    // Add country code
    return `${countryCode}${cleanPhone}`;
  },

  // Validate phone number format
  isValidPhoneNumber(phone: string): boolean {
    // Remove all non-digits for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid 10-digit Indian mobile number
    return /^[6-9]\d{9}$/.test(cleanPhone);
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};