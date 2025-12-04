import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

// Keys for localStorage
const USER_STORAGE_KEY = 'henna_user_data';
const LOGGED_OUT_KEY = 'henna_logged_out';

// Helper to safely get user from localStorage
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Silent fail
  }
  return null;
};

// Helper to safely store user in localStorage
const storeUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem(LOGGED_OUT_KEY); // Clear logout flag
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Silent fail
  }
};

// Check if user explicitly logged out
const hasExplicitlyLoggedOut = (): boolean => {
  try {
    return localStorage.getItem(LOGGED_OUT_KEY) === 'true';
  } catch {
    return false;
  }
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize user from localStorage immediately - NEVER start as null if we have stored data
  const [user, setUser] = useState<User | null>(() => {
    if (hasExplicitlyLoggedOut()) return null;
    return getStoredUser();
  });
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track if user explicitly logged out
  const explicitLogoutRef = useRef(false);

  // Custom setUser that also persists to localStorage
  const setUserPersistent = useCallback((newUser: User | null | ((prev: User | null) => User | null)) => {
    setUser(prev => {
      const resolved = typeof newUser === 'function' ? newUser(prev) : newUser;
      // Only store if not explicitly logged out
      if (!explicitLogoutRef.current) {
        storeUser(resolved);
      }
      return resolved;
    });
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<User | null> => {
    if (!userId) return null;
    
    try {
      const result = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'timeout' } }), 10000)
        ),
      ]);
      
      const { data: profile, error } = result;
      if (error || !profile) return null;
      
      const validRoles: Array<'USER' | 'ARTIST' | 'ADMIN'> = ['USER', 'ARTIST', 'ADMIN'];
      const userRole = validRoles.includes(profile.role) ? profile.role : 'USER';
      
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: userRole,
        avatar: profile.avatar
      };
    } catch {
      return null;
    }
  }, []);


  const migrateAnonymousDesigns = async (userId: string) => {
    try {
      const savedDesigns = localStorage.getItem('henna_saved_designs');
      if (!savedDesigns) return;
      
      const designs = JSON.parse(savedDesigns);
      if (!Array.isArray(designs) || designs.length === 0) return;
      
      let migratedCount = 0;
      for (const design of designs) {
        try {
          await supabase.from('designs').insert({
            user_id: userId,
            hand_image_url: design.imageUrl || '',
            generated_image_url: design.imageUrl,
            outfit_context: design.outfitContext || null,
            hand_analysis: design.analysis ? JSON.stringify(design.analysis) : null,
            is_public: false,
            created_at: design.date ? new Date(design.date).toISOString() : new Date().toISOString(),
          });
          migratedCount++;
        } catch {
          // Silent fail per design
        }
      }
      
      if (migratedCount > 0) {
        localStorage.removeItem('henna_saved_designs');
      }
    } catch {
      // Silent fail
    }
  };

  const refreshUser = useCallback(async () => {
    // If explicitly logged out, don't refresh
    if (explicitLogoutRef.current || hasExplicitlyLoggedOut()) return;
    
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        setSession(currentSession);
        setSupabaseUser(currentSession.user);
        const profile = await fetchProfile(currentSession.user.id);
        if (profile) {
          setUserPersistent(profile);
        }
      }
      // NEVER clear user state here
    } catch {
      // NEVER clear state on errors
    }
  }, [fetchProfile, setUserPersistent]);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeSession = async () => {
      // If explicitly logged out, don't restore
      if (hasExplicitlyLoggedOut()) {
        console.log('[Auth] User explicitly logged out - not restoring');
        setIsLoading(false);
        return;
      }

      // Check for stored user
      const storedUser = getStoredUser();
      if (storedUser) {
        console.log('[Auth] Found stored user:', storedUser.email, 'Role:', storedUser.role);
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (initialSession?.user) {
          console.log('[Auth] Active Supabase session found');
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          
          // Fetch fresh profile but keep stored user while loading
          const profile = await fetchProfile(initialSession.user.id);
          if (mounted && profile) {
            console.log('[Auth] Profile loaded:', profile.email, 'Role:', profile.role);
            setUserPersistent(profile);
          }
        } else {
          console.log('[Auth] No Supabase session - keeping stored user if available');
          // No Supabase session, but we might have stored user
          // Keep the stored user - they might just have an expired token
          // The stored user will be shown until they explicitly logout
        }
      } catch (err) {
        console.warn('[Auth] Session init error:', err);
        // Keep stored user on error
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    initializeSession();

    // Listen ONLY for sign in events - ignore everything else
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        // Only handle explicit sign in
        if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession);
          setSupabaseUser(newSession.user);
          const profile = await fetchProfile(newSession.user.id);
          if (profile) {
            setUserPersistent(profile);
          }
        }
        // IGNORE all other events - especially SIGNED_OUT and TOKEN_REFRESHED failures
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, setUserPersistent]);

  // Background session refresh - but NEVER clear user
  useEffect(() => {
    if (hasExplicitlyLoggedOut()) return;
    
    const refreshSession = async () => {
      if (explicitLogoutRef.current) return;
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          setSupabaseUser(currentSession.user);
          // Silently refresh token
          supabase.auth.refreshSession().catch(() => {});
        }
      } catch {
        // Silent fail - keep user logged in
      }
    };

    // Refresh every 5 minutes
    const interval = setInterval(refreshSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);


  const login = async (email: string, password: string) => {
    // Clear logout flag
    explicitLogoutRef.current = false;
    localStorage.removeItem(LOGGED_OUT_KEY);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No user returned from login');
    
    setSupabaseUser(data.user);
    setSession(data.session);
    
    // Set basic user immediately
    const basicUser: User = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
      role: 'USER',
    };
    setUserPersistent(basicUser);
    
    // Migrate anonymous designs
    migrateAnonymousDesigns(data.user.id).catch(() => {});
    
    // Fetch full profile in background
    fetchProfile(data.user.id).then(profile => {
      if (profile) setUserPersistent(profile);
    }).catch(() => {});
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
    // Clear logout flag
    explicitLogoutRef.current = false;
    localStorage.removeItem(LOGGED_OUT_KEY);
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, phone: data.phone } }
    });
    
    if (error) throw new Error(error.message);
    
    if (authData.user) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const isFirstUser = (count ?? 0) <= 1;
      const userRole = isFirstUser ? 'ADMIN' : 'USER';
      
      let profile = await fetchProfile(authData.user.id);
      
      if (!profile) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: userRole
        });
        profile = await fetchProfile(authData.user.id);
      } else if (isFirstUser && profile.role !== 'ADMIN') {
        await supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', authData.user.id);
        profile = { ...profile, role: 'ADMIN' };
      }
      
      if (profile) setUserPersistent(profile);
    }
  };

  const logout = async () => {
    console.log('[Auth] Explicit logout initiated');
    
    // Mark as explicitly logged out FIRST
    explicitLogoutRef.current = true;
    
    // Clear all state
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    
    // Clear storage and set logout flag
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.setItem(LOGGED_OUT_KEY, 'true');
      localStorage.removeItem('sb-kowuwhlwetplermbdvbh-auth-token');
      sessionStorage.removeItem('sb-kowuwhlwetplermbdvbh-auth-token');
      console.log('[Auth] All storage cleared');
    } catch {
      // Silent fail
    }
    
    // Call Supabase signOut
    supabase.auth.signOut().catch(() => {});
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
    
    setUserPersistent(prev => prev ? { ...prev, ...updated } : null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
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

export const useAuth = useSupabaseAuth;
