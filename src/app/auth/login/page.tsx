'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useGameState } from '@/hooks/useGameState';
import { MagicalButton } from '@/components/ui/MagicalButton';
import type { UserRole } from '@/types/user';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectReason = searchParams.get('reason');
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const { loadFromSupabase } = useGameState();

  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === 'teacher' ? '/archmage-tower' : '/play');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const err = await signIn(email, password);
        if (err) { setError(err); return; }
      } else {
        if (!username.trim()) { setError('A name is required to register.'); return; }
        const err = await signUp(email, password, username.trim(), role);
        if (err) { setError(err); return; }
      }

      // Sync cloud progress after sign-in
      try {
        const { supabase } = await import('@/lib/supabase');
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) await loadFromSupabase(data.session.user.id);
        }
      } catch { /* non-fatal */ }

      // Redirect based on role determined by auth state change
      // Brief wait for onAuthStateChange to fire
      await new Promise((r) => setTimeout(r, 400));
      const { supabase: sb } = await import('@/lib/supabase');
      const { data: sd } = sb ? await sb.auth.getSession() : { data: { session: null } };
      const { getProfile } = await import('@/lib/supabase');
      const profile = sd?.session ? await getProfile(sd.session.user.id) : null;
      router.replace(profile?.role === 'teacher' ? '/archmage-tower' : '/play');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-parchment-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-arcane-gold/40 border-t-arcane-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-dark flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at center top, #4A3520 0%, #2D1B0E 50%, #1A0E05 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-4xl mb-2" aria-hidden="true">🏰</div>
            <h1 className="font-cinzel text-arcane-gold text-2xl font-black tracking-widest">SQL Quest</h1>
            <p className="font-cinzel text-parchment-light/40 text-xs tracking-wider mt-1">The Realm of Syntaxia</p>
          </Link>
        </div>

        {/* Card */}
        {redirectReason === 'login_required' && (
          <div className="mb-4 border border-arcane-gold/30 bg-arcane-gold/5 rounded p-3 text-arcane-gold/80 text-xs font-inter text-center">
            Sign in to access the Archmage Tower.
          </div>
        )}

        <div className="bg-parchment-dark border border-border-gold/40 rounded-lg shadow-arcane-gold p-6">
          <div className="text-center mb-5">
            <h2 className="font-cinzel text-arcane-gold text-lg font-bold tracking-wide">
              {mode === 'signin' ? 'Enter the Realm' : 'Bind Your Soul'}
            </h2>
            <p className="text-parchment-light/40 text-xs font-inter mt-1">
              {mode === 'signin' ? 'Resume your arcane studies' : 'Create your identity in Syntaxia'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded border border-border-gold/30 mb-5 overflow-hidden">
            <TabBtn active={mode === 'signin'} onClick={() => { setMode('signin'); setError(null); }}>Sign In</TabBtn>
            <TabBtn active={mode === 'signup'} onClick={() => { setMode('signup'); setError(null); }} bordered>Register</TabBtn>
          </div>

          {/* Role selector */}
          {mode === 'signup' && (
            <div className="flex rounded border border-border-gold/30 mb-5 overflow-hidden">
              <RoleTab active={role === 'student'} onClick={() => setRole('student')} label="Join as Apprentice" sub="Student" />
              <RoleTab active={role === 'teacher'} onClick={() => setRole('teacher')} label="Join as Archmage" sub="Teacher" bordered />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Field id="username" label="Arcane Name" type="text" value={username}
                onChange={setUsername} placeholder="e.g. Elara the Bold" autoComplete="username" />
            )}
            <Field id="email" label="Scroll Address" type="email" value={email}
              onChange={setEmail} placeholder="you@realm.edu" autoComplete="email" />
            <Field id="password" label="Secret Passphrase" type="password" value={password}
              onChange={setPassword} placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />

            {error && (
              <p role="alert" className="text-arcane-red text-xs font-inter border border-arcane-red/30 bg-arcane-red/5 rounded px-3 py-2">
                {error}
              </p>
            )}

            <MagicalButton variant="gold" size="md" type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Casting...' : mode === 'signin' ? 'Enter the Realm' : role === 'teacher' ? 'Claim the Tower' : 'Begin Apprenticeship'}
            </MagicalButton>
          </form>

          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-border-gold/20">
            <Link href="/play" className="text-parchment-light/30 text-xs font-inter hover:text-parchment-light/60 transition-colors underline underline-offset-2">
              Continue as Guest
            </Link>
            <span className="text-parchment-light/20 text-xs">·</span>
            <Link href="/profile" className="text-parchment-light/30 text-xs font-inter hover:text-parchment-light/60 transition-colors underline underline-offset-2">
              View Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TabBtn({ active, onClick, children, bordered }: {
  active: boolean; onClick: () => void; children: React.ReactNode; bordered?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className={[
        'flex-1 py-2 text-xs font-cinzel tracking-wider transition-colors',
        bordered ? 'border-l border-border-gold/30' : '',
        active ? 'bg-arcane-gold/20 text-arcane-gold' : 'text-parchment-light/40 hover:text-parchment-light/70',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function RoleTab({ active, onClick, label, sub, bordered }: {
  active: boolean; onClick: () => void; label: string; sub: string; bordered?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className={[
        'flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors',
        bordered ? 'border-l border-border-gold/30' : '',
        active ? 'bg-arcane-gold/20 text-arcane-gold' : 'text-parchment-light/40 hover:text-parchment-light/70',
      ].join(' ')}
    >
      <span className="text-xs font-cinzel tracking-wider">{label}</span>
      <span className={`text-[10px] font-inter ${active ? 'text-arcane-gold/60' : 'text-parchment-light/25'}`}>{sub}</span>
    </button>
  );
}

function Field({ id, label, type, value, onChange, placeholder, autoComplete }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} required
        className="w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-inter text-parchment-light placeholder:text-parchment-light/25 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors"
      />
    </div>
  );
}
