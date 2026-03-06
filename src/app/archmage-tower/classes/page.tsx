'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClass, getTeacherClasses, isSupabaseConfigured } from '@/lib/supabase';
import type { ClassRow } from '@/lib/supabase';
import { MagicalButton } from '@/components/ui/MagicalButton';

export default function ClassesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const rows = await getTeacherClasses(user.id);
      setClasses(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setCreating(true);
    setCreateMsg(null);

    const result = await createClass(user.id, name.trim(), description.trim());
    if (typeof result === 'string') {
      setCreateMsg({ ok: false, text: result });
    } else {
      setCreateMsg({ ok: true, text: `Class created! Invite code: ${result.inviteCode}` });
      setName('');
      setDescription('');
      await load();
    }
    setCreating(false);
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-arcane-gold text-xl font-bold mb-1">My Classes</h2>
        <p className="text-parchment-light/40 text-sm font-inter">
          Create classes and share invite codes so apprentices can join and track their progress.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="border border-arcane-gold/20 bg-arcane-gold/5 rounded p-3 text-arcane-gold/70 text-sm font-inter">
          Supabase is not configured — class management is unavailable.
        </div>
      )}

      {error && (
        <div className="border border-arcane-red/30 bg-arcane-red/5 rounded p-3 text-arcane-red text-sm font-inter">{error}</div>
      )}

      {/* Create form */}
      <div className="border border-border-gold/20 rounded-lg p-5 bg-parchment-dark">
        <h3 className="font-cinzel text-arcane-gold font-bold text-sm mb-4 tracking-wide">Create a New Class</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Class Name" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SQL Foundations — Spring 2026"
              className={inputClass} required />
          </Field>
          <Field label="Description (optional)">
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for your students"
              className={inputClass} />
          </Field>
          {createMsg && (
            <p className={`text-xs font-inter border rounded px-3 py-2 font-mono ${createMsg.ok ? 'border-arcane-green/40 bg-arcane-green/5 text-arcane-green' : 'border-arcane-red/30 bg-arcane-red/5 text-arcane-red'}`}>
              {createMsg.text}
            </p>
          )}
          <MagicalButton variant="green" size="sm" type="submit" disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : '+ Create Class'}
          </MagicalButton>
        </form>
      </div>

      {/* Classes list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-border-gold/20 rounded-lg p-4 bg-parchment-dark animate-pulse">
                <div className="h-4 w-48 rounded bg-parchment/10 mb-2" />
                <div className="h-3 w-32 rounded bg-parchment/10" />
              </div>
            ))
          : classes.map((cls) => (
              <div key={cls.id} className="border border-border-gold/20 rounded-lg p-5 bg-parchment-dark">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-cinzel text-arcane-gold font-bold text-sm">{cls.name}</p>
                    {cls.description && (
                      <p className="text-parchment-light/40 text-xs font-inter mt-0.5 truncate">{cls.description}</p>
                    )}
                    <p className="text-parchment-light/25 text-xs font-inter mt-1">
                      {cls.studentCount ?? 0} apprentice{cls.studentCount !== 1 ? 's' : ''} enrolled
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-parchment-light/40 text-xs font-inter mb-1">Invite Code</p>
                    <button
                      type="button"
                      onClick={() => copyCode(cls.invite_code)}
                      className="font-mono text-lg font-bold text-arcane-gold tracking-widest hover:text-arcane-gold/70 transition-colors flex items-center gap-1.5"
                    >
                      {cls.invite_code}
                      <span className="text-xs font-inter text-parchment-light/30">
                        {copiedId === cls.invite_code ? '✓' : '⎘'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

        {!isLoading && classes.length === 0 && !error && (
          <p className="text-center text-parchment-light/30 font-inter text-sm py-8">
            No classes yet. Create one above and share the invite code with your students.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-cinzel text-parchment-light/60 mb-1.5 tracking-wide">
        {label}{required && <span className="text-arcane-red ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = 'w-full bg-parchment-dark/60 border border-border-gold/30 rounded px-3 py-2 text-sm font-inter text-parchment-light placeholder:text-parchment-light/25 focus:outline-none focus:border-arcane-gold/60 focus:ring-1 focus:ring-arcane-gold/20 transition-colors';
