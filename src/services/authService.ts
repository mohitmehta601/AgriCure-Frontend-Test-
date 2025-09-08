import { supabase, UserProfile } from './supabaseClient';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  productId: string;
  mobileNumber: string;
}

export interface SignInData {
  emailOrPhone: string;
  password: string;
}

export interface TempUserData {
  productId: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
}
export const authService = {
  // Validate product ID
  async validateProductId(productId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      return { isValid: !!data && !error, error };
    } catch (error) {
      return { isValid: false, error };
    }
  },

  // Store temporary user data (before verification)
  async storeTempUserData(data: TempUserData) {
    try {
      // Store in localStorage temporarily
      localStorage.setItem('tempUserData', JSON.stringify(data));
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get temporary user data
  getTempUserData(): TempUserData | null {
    try {
      const data = localStorage.getItem('tempUserData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  // Clear temporary user data
  clearTempUserData() {
    localStorage.removeItem('tempUserData');
  },

  // Complete signup after OTP verification (user already created via OTP)
  async completeSignupAfterOTP(data: SignUpData, userId: string) {
    try {
      // First, update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          product_id: data.productId,
          phone_number: data.mobileNumber,
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        // Don't throw here, continue with profile creation
      }

      // Create or update user profile with retry logic
      const maxRetries = 3;
      let profileError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            full_name: data.fullName,
            email: data.email,
            phone_number: data.mobileNumber.startsWith('+') ? data.mobileNumber : `+91${data.mobileNumber}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
        
        if (!error) {
          profileError = null;
          break;
        }
        
        profileError = error;
        console.warn(`Profile creation attempt ${attempt} failed:`, error);
        
        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (profileError) {
        console.error('Failed to create user profile after retries:', profileError);
        // Don't throw error, user is already created in auth
      }

      // Get the current user data to return
      const { data: userData, error: getUserError } = await supabase.auth.getUser();
      
      return { data: userData, error: getUserError };
    } catch (error) {
      console.error('Complete signup error:', error);
      return { data: null, error };
    }
  },

  // Update user profile after signup
  async updateUserProfileAfterSignup(data: SignUpData, userId: string) {
    try {
      const { data: updateData, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: data.fullName,
          email: data.email,
          phone_number: data.mobileNumber.startsWith('+') ? data.mobileNumber : `+91${data.mobileNumber}`,
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      return { data: updateData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Traditional signup with email/password (fallback)
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            product_id: data.productId,
            phone_number: data.mobileNumber.startsWith('+') ? data.mobileNumber : `+91${data.mobileNumber}`,
          }
        }
      });

      if (authError) throw authError;

      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
  // Sign in user
  async signIn(data: SignInData) {
    try {
      // Determine if input is email or phone
      const isEmail = data.emailOrPhone.includes('@');
      
      let signInPayload;
      
      if (isEmail) {
        signInPayload = { 
          email: data.emailOrPhone, 
          password: data.password 
        };
      } else {
        // Format phone number for authentication
        const formattedPhone = data.emailOrPhone.startsWith('+') 
          ? data.emailOrPhone 
          : `+91${data.emailOrPhone}`;
        signInPayload = { 
          phone: formattedPhone, 
          password: data.password 
        };
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword(signInPayload);

      return { data: authData, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};