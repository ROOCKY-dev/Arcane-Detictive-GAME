'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { resetPasswordForEmail } from '@/lib/supabase';
import { MagicalButton } from '@/components/ui/MagicalButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const origin = window.location.origin;
      const err = await resetPasswordForEmail(email.trim(), `${origin}/auth/reset-password`);
      if (err) { setError(err); return; }
      setSent(true);
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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-3xl" aria-hidden="true">📜</div>
              <h2 className="font-cinzel text-arcane-gold text-lg font-bold tracking-wide">Scroll Dispatched</h2>
              <p className="text-parchment-light/60 text-sm font-inter">
                A magical scroll has been sent to <span className="text-arcane-gold">{email}</span>.
                Follow the link inside to set a new passphrase.
              </p>
              <p className="text-parchment-light/40 text-xs font-inter">
                If it doesn&apos;t arrive within a few minutes, check your spam folder.
              </p>
              <Link href="/auth/login">
                <MagicalButton variant="gold" size="sm" className="mt-2">Back to Login</MagicalButton>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <h2 className="font-cinzel text-arcane-gold text-lg font-bold tracking-wide">Recover Passphrase</h2>
                <p className="text-parchment-light/40 text-xs font-inter mt-1">
                  Enter your scroll address and we&apos;ll send a recovery link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">
                    Scroll Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@realm.edu"
                    autoComplete="email"
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
                  {isSubmitting ? 'Sending...' : 'Send Recovery Scroll'}
                </MagicalButton>
              </form>

              <div className="text-center mt-5 pt-4 border-t border-border-gold/20">
                <Link href="/auth/login" className="text-parchment-light/30 text-xs font-inter hover:text-parchment-light/60 transition-colors underline underline-offset-2">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
