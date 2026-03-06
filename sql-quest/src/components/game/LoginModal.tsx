'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGameState } from '@/hooks/useGameState';
import { MagicalButton } from '@/components/ui/MagicalButton';
import type { UserRole } from '@/types/user';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, signUp, isLoading } = useAuth();
  const { loadFromSupabase } = useGameState();

  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'signin') {
      const err = await signIn(email, password);
      if (err) {
        setError(err);
        return;
      }
    } else {
      if (!username.trim()) {
        setError('A name is required to register.');
        return;
      }
      const err = await signUp(email, password, username.trim(), role);
      if (err) {
        setError(err);
        return;
      }
    }

    // After successful auth, merge cloud progress into local state.
    // We get the userId from the auth state via a brief delay to allow
    // onAuthStateChange to fire and populate supabase session.
    try {
      const { supabase } = await import('@/lib/supabase');
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          await loadFromSupabase(data.session.user.id);
        }
      }
    } catch {
      // Non-fatal — local progress is intact
    }

    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-parchment-dark border border-border-gold/40 rounded-lg shadow-arcane-gold p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-cinzel text-arcane-gold text-xl font-bold tracking-wide">
            {mode === 'signin' ? 'Enter the Realm' : 'Bind Your Soul'}
          </h2>
          <p className="text-parchment-light/50 text-xs font-inter mt-1">
            {mode === 'signin'
              ? 'Resume your arcane studies'
              : 'Create your identity in Syntaxia'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded border border-border-gold/30 mb-5 overflow-hidden">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 text-xs font-cinzel tracking-wider transition-colors ${
              mode === 'signin'
                ? 'bg-arcane-gold/20 text-arcane-gold'
                : 'text-parchment-light/40 hover:text-parchment-light/70'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-xs font-cinzel tracking-wider transition-colors border-l border-border-gold/30 ${
              mode === 'signup'
                ? 'bg-arcane-gold/20 text-arcane-gold'
                : 'text-parchment-light/40 hover:text-parchment-light/70'
            }`}
          >
            Register
          </button>
        </div>

        {/* Role toggle — only shown on signup */}
        {mode === 'signup' && (
          <div className="flex rounded border border-border-gold/30 mb-5 overflow-hidden">
            <RoleTab
              active={role === 'student'}
              onClick={() => setRole('student')}
              label="Join as Apprentice"
              sub="Student"
            />
            <RoleTab
              active={role === 'teacher'}
              onClick={() => setRole('teacher')}
              label="Join as Archmage"
              sub="Teacher"
              bordered
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Field
              id="username"
              label="Arcane Name"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="e.g. Elara the Bold"
              autoComplete="username"
            />
          )}

          <Field
            id="email"
            label="Scroll Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@realm.edu"
            autoComplete="email"
          />

          <Field
            id="password"
            label="Secret Passphrase"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />

          {error && (
            <p
              role="alert"
              className="text-arcane-red text-xs font-inter border border-arcane-red/30 bg-arcane-red/5 rounded px-3 py-2"
            >
              {error}
            </p>
          )}

          <MagicalButton
            variant="gold"
            size="md"
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading
              ? 'Casting...'
              : mode === 'signin'
              ? 'Enter the Realm'
              : role === 'teacher'
              ? 'Claim the Tower'
              : 'Begin Apprenticeship'}
          </MagicalButton>
        </form>

        {/* Guest continue */}
        <p className="text-center mt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-parchment-light/30 text-xs font-inter hover:text-parchment-light/60 transition-colors underline underline-offset-2"
          >
            Continue as guest
          </button>
        </p>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-parchment-light/30 hover:text-parchment-light/70 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleTab({
  active,
  onClick,
  label,
  sub,
  bordered,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  bordered?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors ${
        bordered ? 'border-l border-border-gold/30' : ''
      } ${
        active
          ? 'bg-arcane-gold/20 text-arcane-gold'
          : 'text-parchment-light/40 hover:text-parchment-light/70'
      }`}
    >
      <span className="text-xs font-cinzel tracking-wider">{label}</span>
      <span className={`text-[10px] font-inter ${active ? 'text-arcane-gold/60' : 'text-parchment-light/25'}`}>
        {sub}
      </span>
    </button>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-inter text-parchment-light placeholder:text-parchment-light/25 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors"
      />
    </div>
  );
}
