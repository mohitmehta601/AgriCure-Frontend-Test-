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
  // Send OTP via email
  async sendEmailOTP(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        }
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Send OTP via SMS
  async sendPhoneOTP(phone: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          shouldCreateUser: false,
        }
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Verify OTP
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
      return { data: null, error };
    }
  },

  // Resend OTP
  async resendOTP(data: SendOTPData) {
    if (data.type === 'email' && data.email) {
      return this.sendEmailOTP(data.email);
    } else if (data.type === 'phone' && data.phone) {
      return this.sendPhoneOTP(data.phone);
    }
    return { data: null, error: new Error('Invalid OTP resend data') };
  }
};