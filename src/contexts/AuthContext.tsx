'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import * as db from '@/lib/data';

import { authService } from '@/services/authService';
import { getSupabaseClient } from '@/lib/supabase/client';
import { supabaseService } from '@/services/supabaseService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleDemo: (role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize seed data and check for existing session
    db.seedData();
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);

    // Listen to Supabase Auth State (OAuth callback / session changes)
    const client = getSupabaseClient();
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          const email = session.user.email;
          if (!email) return;

          let existingUser: User | null | undefined = db.getUserByEmail(email);
          if (!existingUser) {
            existingUser = await supabaseService.getUserByEmail(email);
          }

          if (!existingUser) {
            const savedRole = (typeof window !== 'undefined' ? localStorage.getItem('oauth_selected_role') : null) as UserRole || 'penerima';
            const fullName = session.user.user_metadata?.full_name ||
                             session.user.user_metadata?.name ||
                             email.split('@')[0];
            const avatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;

            const newUser: User = {
              id: session.user.id || `google-${Date.now()}`,
              name: fullName,
              email: email,
              password: 'oauth_authenticated',
              role: savedRole,
              phone: session.user.phone || '081234567890',
              avatar: avatar,
              createdAt: new Date().toISOString(),
            };

            db.createUser(newUser);
            await supabaseService.createUser(newUser);
            existingUser = newUser;
          }

          db.setCurrentUser(existingUser);
          setUser(existingUser);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('oauth_selected_role');
            if (window.location.hash.includes('login') || window.location.hash.includes('register') || !window.location.hash || window.location.hash === '#/') {
              if (existingUser.role === 'penyedia') window.location.hash = '#/penyedia';
              else if (existingUser.role === 'admin') window.location.hash = '#/admin';
              else window.location.hash = '#/penerima';
            }
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authService.login({ email, password });
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      if (err?.statusCode === 503 || err?.message?.includes('Offline')) {
        return { success: false, error: err.message };
      }
      const result = db.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: err.message || result.error || 'Login gagal' };
    }
  }, []);

  const loginWithGoogle = useCallback(async (selectedRole: UserRole = 'penerima') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oauth_selected_role', selectedRole);
    }
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase client belum terkonfigurasi' };
    }
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;

      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal memulai login Google' };
    }
  }, []);

  const loginWithGoogleDemo = useCallback(async (selectedRole: UserRole = 'penerima') => {
    try {
      const demoEmail = selectedRole === 'penyedia'
        ? 'mitra.google@aksespangan.id'
        : 'budi.google@aksespangan.id';
      const demoName = selectedRole === 'penyedia'
        ? 'Dapur Berkah (Google Account)'
        : 'Budi Santoso (Google Account)';

      let existingUser = db.getUserByEmail(demoEmail);
      if (!existingUser) {
        const newUser: User = {
          id: `google-demo-${selectedRole}-${Date.now()}`,
          name: demoName,
          email: demoEmail,
          password: 'google-oauth-demo',
          role: selectedRole,
          phone: '081298765432',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          businessName: selectedRole === 'penyedia' ? 'Dapur Berkah Pratama' : undefined,
          businessType: selectedRole === 'penyedia' ? 'katering' : undefined,
          businessAddress: selectedRole === 'penyedia' ? 'Jl. Riau No. 45, Bandung' : undefined,
          createdAt: new Date().toISOString(),
        };
        db.createUser(newUser);
        existingUser = newUser;
      }
      db.setCurrentUser(existingUser);
      setUser(existingUser);

      if (typeof window !== 'undefined') {
        if (selectedRole === 'penyedia') window.location.hash = '#/penyedia';
        else if (selectedRole === 'admin') window.location.hash = '#/admin';
        else window.location.hash = '#/penerima';
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal masuk dengan Google demo' };
    }
  }, []);

  const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const res = await authService.register({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role === 'admin' ? 'penyedia' : userData.role,
        businessName: userData.businessName,
        businessAddress: userData.businessAddress,
        businessType: userData.businessType,
        lat: userData.location?.lat,
        lng: userData.location?.lng,
      });
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err: any) {
      if (err?.statusCode === 503 || err?.message?.includes('Offline')) {
        return { success: false, error: err.message };
      }
      const existing = db.getUserByEmail(userData.email);
      if (existing) {
        return { success: false, error: 'Email sudah terdaftar' };
      }
      const newUser = db.createUser(userData);
      db.setCurrentUser(newUser);
      setUser(newUser);
      return { success: true, user: newUser };
    }
  }, []);

  const logout = useCallback(() => {
    const client = getSupabaseClient();
    if (client) {
      try {
        client.auth.signOut();
      } catch {}
    }
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = db.updateUser(user.id, updates);
    if (updated) {
      setUser(updated);
      db.setCurrentUser(updated);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithGoogleDemo,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(requiredRole?: UserRole): AuthContextType {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.hash = '#/login';
    }
    if (requiredRole && auth.user && auth.user.role !== requiredRole) {
      window.location.hash = '#/';
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, requiredRole]);
  return auth;
}
