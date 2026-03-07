'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase, updatePassword } from '@/lib/supabase';
import { MagicalButton } from '@/components/ui/MagicalButton';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    // Flow 1: onAuthStateChange fires PASSWORD_RECOVERY when Supabase auto-exchanges
    // the hash-based token (#access_token=...&type=recovery) on page load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        setTokenError(null);
      }
    });

    // Flow 2: Newer Supabase sends ?token_hash=...&type=recovery as query params.
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error: err }) => {
        if (err) setTokenError(err.message);
        else setSessionReady(true);
      });
      return () => subscription.unsubscribe();
    }

    // Flow 3: No params at all — check if there is already an active session
    // (happens when hash was processed before this component mounted).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Give onAuthStateChange a moment to fire before showing the error.
        const timer = setTimeout(() => {
          setTokenError('Invalid or expired recovery link. Please request a new one.');
        }, 1500);
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Passphrase must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passphrases do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const err = await updatePassword(password);
      if (err) { setError(err); return; }
      setDone(true);
      setTimeout(() => router.replace('/auth/login'), 2500);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at center top, #4A3520 0%, #2D1B0E 50%, #1A0E05 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-4xl mb-2" aria-hidden="true">🏰</div>
            <h1 className="font-cinzel text-arcane-gold text-2xl font-black tracking-widest">SQL Quest</h1>
            <p className="font-cinzel text-parchment-light/40 text-xs tracking-wider mt-1">The Realm of Syntaxia</p>
          </Link>
        </div>

        <div className="bg-parchment-dark border border-border-gold/40 rounded-lg shadow-arcane-gold p-6">
          {tokenError ? (
            <div className="text-center space-y-4">
              <div className="text-3xl" aria-hidden="true">⚠️</div>
              <h2 className="font-cinzel text-arcane-gold text-lg font-bold tracking-wide">Link Expired</h2>
              <p className="text-parchment-light/60 text-sm font-inter">{tokenError}</p>
              <Link href="/auth/forgot-password">
                <MagicalButton variant="gold" size="sm">Request New Link</MagicalButton>
              </Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <div className="text-3xl" aria-hidden="true">✨</div>
              <h2 className="font-cinzel text-arcane-gold text-lg font-bold tracking-wide">Passphrase Updated</h2>
              <p className="text-parchment-light/60 text-sm font-inter">
                Your new passphrase is set. Redirecting you to login...
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-2 border-arcane-gold/40 border-t-arcane-gold rounded-full animate-spin" />
              <p className="text-parchment-light/40 text-xs font-inter">Verifying recovery link...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <h2 className="font-cinzel text-arcane-gold text-lg font-bold tracking-wide">Set New Passphrase</h2>
                <p className="text-parchment-light/40 text-xs font-inter mt-1">
                  Choose a new secret passphrase for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">
                    New Passphrase
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-inter text-parchment-light placeholder:text-parchment-light/25 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">
                    Confirm Passphrase
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-inter text-parchment-light placeholder:text-parchment-light/25 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-arcane-red text-xs font-inter border border-arcane-red/30 bg-arcane-red/5 rounded px-3 py-2">
                    {error}
                  </p>
                )}

                <MagicalButton variant="gold" size="md" type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Updating...' : 'Update Passphrase'}
                </MagicalButton>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
