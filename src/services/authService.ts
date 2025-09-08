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

  // Complete signup after OTP verification
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        phone: data.mobileNumber,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            full_name: data.fullName,
            email: data.email,
            phone_number: data.mobileNumber,
          });

        if (profileError) throw profileError;
      }

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
      
      const signInData = isEmail 
        ? { email: data.emailOrPhone, password: data.password }
        : { phone: data.emailOrPhone, password: data.password };

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

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