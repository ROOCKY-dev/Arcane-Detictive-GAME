'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useGameState } from '@/hooks/useGameState';
import { updateProfile, joinClassByCode, isSupabaseConfigured } from '@/lib/supabase';
import { MagicalButton } from '@/components/ui/MagicalButton';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { completedQuestIds } = useGameState();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.username ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);
    const err = await updateProfile(user.id, {
      display_name: displayName.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    } as { display_name?: string; avatar_url?: string });
    setSaveMsg(err ? { ok: false, text: err } : { ok: true, text: 'Profile updated!' });
    setSaving(false);
  }

  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setJoining(true);
    setJoinMsg(null);
    const err = await joinClassByCode(user.id, inviteCode);
    setJoinMsg(err ? { ok: false, text: err } : { ok: true, text: 'Enrolled in class!' });
    if (!err) setInviteCode('');
    setJoining(false);
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-parchment-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-arcane-gold/40 border-t-arcane-gold rounded-full animate-spin" />
      </div>
    );
  }

  const roleLabel = user?.role === 'teacher' ? 'Archmage' : user?.role === 'admin' ? 'Grand Archon' : 'Apprentice';
  const roleBadgeColor = user?.role === 'teacher' ? 'text-arcane-blue border-arcane-blue/40 bg-arcane-blue/10' : 'text-arcane-gold border-arcane-gold/40 bg-arcane-gold/10';

  return (
    <div className="min-h-screen bg-parchment-dark"
      style={{ background: 'radial-gradient(ellipse at center top, #4A3520 0%, #2D1B0E 50%, #1A0E05 100%)' }}
    >
      {/* Navbar */}
      <header className="border-b border-border-gold/20 px-4 py-3 flex items-center justify-between bg-parchment-dark/80">
        <Link href="/" className="font-cinzel text-arcane-gold font-bold text-sm tracking-wider hover:opacity-80 transition-opacity">
          🏰 SQL Quest
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/play">
            <MagicalButton variant="gold" size="sm">← Realm</MagicalButton>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto py-8 px-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* Guest state */}
          {!user && (
            <div className="border border-border-gold/30 rounded-lg p-8 bg-parchment-dark text-center space-y-4">
              <div className="text-5xl" aria-hidden="true">👤</div>
              <h2 className="font-cinzel text-arcane-gold text-xl font-bold">You are a Guest</h2>
              <p className="text-parchment-light/50 text-sm font-inter">
                Sign in to save your progress to the cloud, join a class, and track your achievements.
              </p>
              <Link href="/auth/login">
                <MagicalButton variant="gold">Sign In / Register</MagicalButton>
              </Link>
              {!isSupabaseConfigured && (
                <p className="text-parchment-light/25 text-xs font-inter italic">
                  Supabase is not configured — auth is unavailable in this environment.
                </p>
              )}
            </div>
          )}

          {/* Authenticated state */}
          {user && (
            <div className="space-y-5">
              {/* Identity card */}
              <div className="border border-border-gold/30 rounded-lg p-5 bg-parchment-dark flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-arcane-gold/50 bg-parchment-dark flex items-center justify-center text-3xl shrink-0">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true">{user.role === 'teacher' ? '🧙' : '⚔️'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-cinzel text-arcane-gold font-bold text-lg truncate">{user.username}</p>
                  <p className="text-parchment-light/50 text-xs font-inter truncate">{user.email}</p>
                  <span className={`inline-block mt-1 border rounded px-2 py-0.5 text-[10px] font-cinzel tracking-wide ${roleBadgeColor}`}>
                    {roleLabel}
                  </span>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <p className="font-cinzel text-arcane-gold text-2xl font-bold">{completedQuestIds.length}</p>
                  <p className="text-parchment-light/40 text-xs font-inter">cases solved</p>
                </div>
              </div>

              {/* Edit profile */}
              <Section title="Edit Profile">
                <form onSubmit={handleSave} className="space-y-4">
                  <Field label="Display Name">
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={user.username} className={inputClass} />
                  </Field>
                  <Field label="Avatar URL">
                    <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png" className={inputClass} />
                  </Field>
                  {saveMsg && (
                    <p className={`text-xs font-inter border rounded px-3 py-2 ${saveMsg.ok ? 'border-arcane-green/40 bg-arcane-green/5 text-arcane-green' : 'border-arcane-red/30 bg-arcane-red/5 text-arcane-red'}`}>
                      {saveMsg.text}
                    </p>
                  )}
                  <MagicalButton variant="gold" size="sm" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </MagicalButton>
                </form>
              </Section>

              {/* Join class — students only */}
              {user.role === 'student' && (
                <Section title="Join a Class">
                  <p className="text-parchment-light/40 text-xs font-inter mb-3">
                    Enter the invite code from your Archmage to enroll in their class.
                  </p>
                  <form onSubmit={handleJoinClass} className="flex gap-2">
                    <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AB1C2D" maxLength={6}
                      className={`${inputClass} flex-1 tracking-widest font-cinzel uppercase`} />
                    <MagicalButton variant="blue" size="sm" type="submit" disabled={joining || inviteCode.length < 4}>
                      {joining ? '...' : 'Join'}
                    </MagicalButton>
                  </form>
                  {joinMsg && (
                    <p className={`mt-2 text-xs font-inter border rounded px-3 py-2 ${joinMsg.ok ? 'border-arcane-green/40 bg-arcane-green/5 text-arcane-green' : 'border-arcane-red/30 bg-arcane-red/5 text-arcane-red'}`}>
                      {joinMsg.text}
                    </p>
                  )}
                </Section>
              )}

              {/* Teacher shortcut */}
              {user.role === 'teacher' && (
                <Section title="Teacher Tools">
                  <div className="flex flex-wrap gap-2">
                    <Link href="/archmage-tower/apprentices">
                      <MagicalButton variant="gold" size="sm">📜 My Apprentices</MagicalButton>
                    </Link>
                    <Link href="/archmage-tower/my-quests">
                      <MagicalButton variant="blue" size="sm">⚒️ My Quests</MagicalButton>
                    </Link>
                    <Link href="/archmage-tower/classes">
                      <MagicalButton variant="gold" size="sm">🏫 My Classes</MagicalButton>
                    </Link>
                  </div>
                </Section>
              )}

              {/* Sign out */}
              <div className="pt-2">
                <button type="button" onClick={handleSignOut}
                  className="text-arcane-red/60 text-xs font-inter hover:text-arcane-red transition-colors underline underline-offset-2">
                  Sign out of {user.username}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border-gold/20 rounded-lg p-5 bg-parchment-dark">
      <h3 className="font-cinzel text-arcane-gold font-bold text-sm mb-4 tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-inter text-parchment-light placeholder:text-parchment-light/25 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors';
