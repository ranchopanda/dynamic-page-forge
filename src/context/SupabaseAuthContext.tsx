import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ARTIST' | 'ADMIN';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<User | null> => {
    if (!userId) return null;
    
    try {
      // Race between fetch and timeout
      const result = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'timeout' } }), 10000)
        ),
      ]);
      
      const { data: profile, error } = result;
      
      if (error) {
        // Only log actual errors, not timeouts in production
        if (error.message !== 'timeout' && process.env.NODE_ENV === 'development') {
          console.error('Profile fetch error:', error);
        }
        return null;
      }
      
      if (!profile) return null;
      
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: profile.role as 'USER' | 'ARTIST' | 'ADMIN',
        avatar: profile.avatar
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile fetch exception:', err);
      }
      return null;
    }
  }, []);


  const refreshUser = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        setSession(currentSession);
        setSupabaseUser(currentSession.user);
        const profile = await fetchProfile(currentSession.user.id);
        setUser(profile);
      } else {
        setSession(null);
        setSupabaseUser(null);
        setUser(null);
      }
    } catch (err: any) {
      // Handle storage errors gracefully
      if (err?.message?.toLowerCase().includes('storage')) {
        console.warn('Storage access blocked during refresh');
      }
      setSession(null);
      setSupabaseUser(null);
      setUser(null);
    }
  }, [fetchProfile]);

  useEffect(() => {
    // Get initial session with comprehensive error handling for storage issues
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session retrieval error:', error.message);
        } else {
          setSession(initialSession);
          setSupabaseUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            fetchProfile(initialSession.user.id).then(setUser).catch(() => {
              // Ignore profile fetch errors during init
            });
          }
        }
      } catch (err: any) {
        // Handle storage access errors gracefully
        const message = err?.message || String(err);
        if (message.toLowerCase().includes('storage') || message.toLowerCase().includes('access')) {
          console.warn('Storage access blocked during session init (suppressed)');
        } else {
          console.warn('Session initialization error:', message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSession();

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          setSupabaseUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            const profile = await fetchProfile(newSession.user.id);
            setUser(profile);
          } else {
            setUser(null);
          }
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      subscription = data.subscription;
    } catch (err) {
      console.warn('Auth state listener setup failed:', err);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('No user returned from login');
    }
    
    setSupabaseUser(data.user);
    setSession(data.session);
    
    // Set basic user immediately so login completes
    const basicUser: User = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
      role: 'USER',
    };
    setUser(basicUser);
    
    // Fetch full profile in background (don't await)
    fetchProfile(data.user.id)
      .then(profile => {
        if (profile) {
          setUser(profile);
        }
      })
      .catch(err => {
        // Ignore profile fetch errors - user is already logged in with basic info
        console.warn('Background profile fetch failed:', err?.message);
      });
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone
        }
      }
    });
    
    if (error) throw new Error(error.message);
    
    // Profile is created automatically via trigger, but we may need to wait
    if (authData.user) {
      // Small delay to allow trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if this is the first user (make them admin)
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const isFirstUser = (count ?? 0) <= 1;
      const userRole = isFirstUser ? 'ADMIN' : 'USER';
      
      let profile = await fetchProfile(authData.user.id);
      
      // If profile still doesn't exist, create it manually
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: userRole
          });
        
        if (insertError) {
          throw new Error('Failed to create user profile');
        }
        
        profile = await fetchProfile(authData.user.id);
      } else if (isFirstUser && profile.role !== 'ADMIN') {
        // Update existing profile to admin if first user
        await supabase
          .from('profiles')
          .update({ role: 'ADMIN' })
          .eq('id', authData.user.id);
        
        profile = { ...profile, role: 'ADMIN' };
      }
      
      setUser(profile);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      // Ignore storage errors during logout
      console.warn('Logout error (ignored):', err?.message);
    }
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    if (!supabaseUser) throw new Error('Not authenticated');
    
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', supabaseUser.id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    setUser(prev => prev ? { ...prev, ...updated } : null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// Re-export as useAuth for compatibility
export const useAuth = useSupabaseAuth;
