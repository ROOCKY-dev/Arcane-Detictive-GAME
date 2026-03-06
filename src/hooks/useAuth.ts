/**
 * useAuth — Supabase authentication state hook.
 * Subscribes to auth changes and exposes typed user profile.
 * Safe to use when Supabase is not configured (returns null user).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  getProfile,
} from '@/lib/supabase';
import type { UserProfile } from '@/types/user';
import type { UserRole } from '@/types/user';

interface UseAuthReturn {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Sign in with email + password. Returns error message or null. */
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Register with role selection. Returns error message or null. */
  signUp: (
    email: string,
    password: string,
    username: string,
    role: UserRole
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
}

/** Map a Supabase profile row + auth user into our typed UserProfile */
function buildUserProfile(
  authUser: { id: string; email?: string },
  profile: { username: string; role: UserRole; avatar_url: string | null; created_at: string } | null
): UserProfile {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    username: profile?.username ?? authUser.email ?? 'Apprentice',
    role: profile?.role ?? 'student',
    createdAt: profile?.created_at ?? new Date().toISOString(),
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Hydrate from existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setUser(buildUserProfile(session.user, profile));
      }
      setIsLoading(false);
    });

    // Subscribe to future auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Small delay to allow profile insert (signUp) to commit first
        if (event === 'SIGNED_IN') {
          await new Promise((r) => setTimeout(r, 500));
        }
        const profile = await getProfile(session.user.id);
        setUser(buildUserProfile(session.user, profile));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      setIsLoading(true);
      const error = await signInWithEmail(email, password);
      setIsLoading(false);
      return error;
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      role: UserRole
    ): Promise<string | null> => {
      setIsLoading(true);
      const error = await signUpWithEmail(email, password, username, role);
      setIsLoading(false);
      return error;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
  };
}
