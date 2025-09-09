import { supabase } from './supabaseClient';

// Network retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2
};

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry network requests
const retryNetworkRequest = async <T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // Check if it's a network error that we should retry
    const isNetworkError = 
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('ERR_NETWORK_CHANGED') ||
      error.message?.includes('Network request failed') ||
      error.name === 'AuthRetryableFetchError' ||
      error.name === 'TypeError';

    if (isNetworkError && retries > 0) {
      console.log(`Network error detected, retrying... (${retries} attempts left)`);
      await wait(RETRY_CONFIG.retryDelay * (RETRY_CONFIG.maxRetries - retries + 1));
      return retryNetworkRequest(operation, retries - 1);
    }
    
    throw error;
  }
};

export interface OTPVerificationData {
  type: 'email' | 'sms';
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
    return retryNetworkRequest(async () => {
      try {
        console.log('Sending email OTP for signup to:', email);
        
        // Check network connectivity first
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network and try again.');
        }
        
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: undefined, // Prevent redirect for OTP flow
            data: {
              email_confirm: false, // We'll handle confirmation via OTP
            }
          }
        });

        if (error) {
          console.error('Email OTP signup error:', error);
          throw error;
        }

        console.log('Email OTP sent successfully:', data);
        return { data, error: null };
      } catch (error: any) {
        console.error('Email OTP signup error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Signups not allowed')) {
          throw new Error('Email signup is disabled. Please contact support or enable email signups in Supabase dashboard.');
        }
        if (error.message?.includes('User already registered')) {
          throw new Error('This email is already registered. Please use the login page instead.');
        }
        if (error.message?.includes('Failed to fetch') || error.name === 'AuthRetryableFetchError') {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
        
        throw new Error(error.message || 'Failed to send email OTP');
      }
    });
  },

  // Send OTP via phone for signup (creates new user)
  async sendPhoneOTPForSignup(phone: string) {
    return retryNetworkRequest(async () => {
      try {
        // Clean and format phone number properly
        const cleanPhone = phone.replace(/\D/g, '');
        let formattedPhone = phone;
        
        // Format based on phone number length and pattern
        if (cleanPhone.length === 10 && cleanPhone.match(/^[6-9]/)) {
          formattedPhone = `+91${cleanPhone}`;
        } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
          formattedPhone = `+${cleanPhone}`;
        } else if (cleanPhone.length === 13 && cleanPhone.startsWith('91')) {
          formattedPhone = `+${cleanPhone}`;
        } else if (!phone.startsWith('+91')) {
          // Try to extract 10 digits if possible
          const extractedDigits = cleanPhone.slice(-10);
          if (extractedDigits.match(/^[6-9]\d{9}$/)) {
            formattedPhone = `+91${extractedDigits}`;
          } else {
            throw new Error('Invalid phone number format. Please enter a valid 10-digit mobile number.');
          }
        }
        
        console.log('Sending phone OTP for signup to:', formattedPhone);
        
        // Validate the final formatted phone number
        if (!this.isValidFormattedPhoneNumber(formattedPhone)) {
          throw new Error('Invalid phone number format. Please enter a valid 10-digit mobile number.');
        }
        
        // Check network connectivity first
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network and try again.');
        }
        
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: true,
            data: {
              phone_confirm: false, // We'll handle confirmation via OTP
            }
          }
        });

        if (error) {
          console.error('Phone OTP signup error:', error);
          throw error;
        }

        console.log('Phone OTP sent successfully:', data);
        return { data, error: null };
      } catch (error: any) {
        console.error('Phone OTP signup error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Signups not allowed')) {
          throw new Error('Phone signup is disabled. Please contact support or enable phone signups in Supabase dashboard.');
        }
        if (error.message?.includes('User already registered')) {
          throw new Error('This phone number is already registered. Please use the login page instead.');
        }
        if (error.message?.includes('SMS provider')) {
          throw new Error('SMS service is not configured. Please contact support.');
        }
        if (error.message?.includes('Failed to fetch') || error.name === 'AuthRetryableFetchError') {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
        
        throw new Error(error.message || 'Failed to send SMS OTP');
      }
    });
  },

  // Send OTP via email for existing users (login)
  async sendEmailOTPForLogin(email: string) {
    try {
      console.log('Sending email OTP for login to:', email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Only existing users
          emailRedirectTo: undefined, // Prevent redirect for OTP flow
        }
      });

      if (error) {
        console.error('Email OTP login error:', error);
        throw error;
      }

      console.log('Email OTP for login sent successfully:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Email OTP login error:', error);
      
      if (error.message?.includes('User not found')) {
        throw new Error('No account found with this email. Please sign up first.');
      }
      
      throw new Error(error.message || 'Failed to send email OTP');
    }
  },

  // Send OTP via phone for existing users (login)
  async sendPhoneOTPForLogin(phone: string) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      console.log('Sending phone OTP for login to:', formattedPhone);
      
      if (!this.isValidPhoneNumber(phone)) {
        throw new Error('Invalid phone number format. Please enter a valid 10-digit mobile number.');
      }
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: false, // Only existing users
        }
      });

      if (error) {
        console.error('Phone OTP login error:', error);
        throw error;
      }

      console.log('Phone OTP for login sent successfully:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Phone OTP login error:', error);
      
      if (error.message?.includes('User not found')) {
        throw new Error('No account found with this phone number. Please sign up first.');
      }
      if (error.message?.includes('SMS provider')) {
        throw new Error('SMS service is not configured. Please contact support.');
      }
      
      throw new Error(error.message || 'Failed to send SMS OTP');
    }
  },

  // Verify OTP for both signup and login
  async verifyOTP(verificationData: OTPVerificationData) {
    return retryNetworkRequest(async () => {
      try {
        console.log('Verifying OTP:', { type: verificationData.type, hasToken: !!verificationData.token });
        
        // Check network connectivity first
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network and try again.');
        }
        
        let otpData: any;
        
        if (verificationData.type === 'email') {
          otpData = {
            type: 'email' as const,
            token: verificationData.token,
            email: verificationData.email,
          };
        } else {
          otpData = {
            type: 'sms' as const,
            token: verificationData.token,
            phone: verificationData.phone,
          };
        }
        
        const { data, error } = await supabase.auth.verifyOtp(otpData);

        if (error) {
          console.error('OTP verification error:', error);
          throw error;
        }

        console.log('OTP verification successful:', data);
        return { data, error: null };
      } catch (error: any) {
        console.error('OTP verification error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Token has expired')) {
          throw new Error('OTP has expired. Please request a new one.');
        }
        if (error.message?.includes('Invalid token')) {
          throw new Error('Invalid OTP code. Please check and try again.');
        }
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Email verification failed. Please try again.');
        }
        if (error.message?.includes('Phone not confirmed')) {
          throw new Error('Phone verification failed. Please try again.');
        }
        if (error.message?.includes('Failed to fetch') || error.name === 'AuthRetryableFetchError') {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
        
        throw new Error(error.message || 'OTP verification failed');
      }
    });
  },

  // Resend OTP for signup
  async resendOTPForSignup(data: SendOTPData) {
    try {
      if (data.type === 'email' && data.email) {
        return await this.sendEmailOTPForSignup(data.email);
      } else if (data.type === 'phone' && data.phone) {
        return await this.sendPhoneOTPForSignup(data.phone);
      }
      throw new Error('Invalid resend data provided');
    } catch (error) {
      return { data: null, error };
    }
  },

  // Resend OTP for login
  async resendOTPForLogin(data: SendOTPData) {
    try {
      if (data.type === 'email' && data.email) {
        return await this.sendEmailOTPForLogin(data.email);
      } else if (data.type === 'phone' && data.phone) {
        return await this.sendPhoneOTPForLogin(data.phone);
      }
      throw new Error('Invalid resend data provided');
    } catch (error) {
      return { data: null, error };
    }
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
    // OR if it's already formatted with +91 (13 digits total)
    if (cleanPhone.length === 10) {
      return /^[6-9]\d{9}$/.test(cleanPhone);
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      return /^91[6-9]\d{9}$/.test(cleanPhone);
    } else if (cleanPhone.length === 13 && cleanPhone.startsWith('91')) {
      return /^91[6-9]\d{9}$/.test(cleanPhone);
    }
    
    return false;
  },

  // Validate formatted phone number (with +91 prefix)
  isValidFormattedPhoneNumber(phone: string): boolean {
    // Should be in format +91xxxxxxxxxx where x is 10 digits starting with 6-9
    return /^\+91[6-9]\d{9}$/.test(phone);
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};