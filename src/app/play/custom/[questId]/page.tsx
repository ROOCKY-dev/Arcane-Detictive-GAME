'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomQuest, isSupabaseConfigured } from '@/lib/supabase';
import type { CustomQuestRow } from '@/lib/supabase';
import { CustomInteriorView } from './CustomInteriorView';
import { MagicalButton } from '@/components/ui/MagicalButton';

export default function CustomQuestPage() {
  const params = useParams();
  const router = useRouter();
  const questId = typeof params.questId === 'string' ? params.questId : '';

  const [quest, setQuest] = useState<CustomQuestRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questId) { setError('Invalid quest ID.'); setIsLoading(false); return; }
    if (!isSupabaseConfigured) { setError('Supabase is not configured.'); setIsLoading(false); return; }

    let cancelled = false;
    getCustomQuest(questId)
      .then((data) => {
        if (cancelled) return;
        if (!data) setError('Quest not found. The code may be incorrect.');
        else setQuest(data);
      })
      .catch(() => { if (!cancelled) setError('Failed to load quest.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [questId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment-dark flex items-center justify-center gap-3">
        <span className="animate-spin text-2xl" aria-hidden="true">✨</span>
        <p className="text-parchment-light/50 font-inter text-sm">Summoning the assignment...</p>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="min-h-screen bg-parchment-dark flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-arcane-red font-inter text-sm text-center">{error ?? 'Unknown error.'}</p>
        <MagicalButton variant="gold" size="sm" onClick={() => router.push('/play')}>
          ← Back to Map
        </MagicalButton>
      </div>
    );
  }

  return <CustomInteriorView quest={quest} />;
}
