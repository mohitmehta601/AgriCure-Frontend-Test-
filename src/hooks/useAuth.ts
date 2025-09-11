import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AuthApiService } from '@/services/authApi';
import type { Profile, AuthUser } from '@/lib/supabaseClient';

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await AuthApiService.getCurrentProfile();
          setAuthState({
            user: session.user as AuthUser,
            profile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await AuthApiService.getCurrentProfile();
          setAuthState({
            user: session.user as AuthUser,
            profile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await AuthApiService.signOut();
  };

  const refreshProfile = async () => {
    if (authState.user) {
      const { data: profile } = await AuthApiService.getCurrentProfile();
      setAuthState(prev => ({ ...prev, profile }));
    }
  };

  return {
    ...authState,
    signOut,
    refreshProfile,
  };
}