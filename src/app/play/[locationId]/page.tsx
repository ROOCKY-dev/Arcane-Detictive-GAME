'use client';

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { StreetView } from '@/components/game/StreetView';
import { MagicalButton } from '@/components/ui/MagicalButton';
import { useGameState } from '@/hooks/useGameState';
import { getLocation } from '@/data/locations';

export default function StreetViewPage() {
  const params = useParams<{ locationId: string }>();
  const { locationId } = params;
  const { completedQuestIds, unlockedLocationIds } = useGameState();

  let location;
  try {
    location = getLocation(locationId);
  } catch {
    notFound();
  }

  if (!unlockedLocationIds.includes(locationId)) {
    return (
      <div className="min-h-screen bg-parchment-dark flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl" aria-hidden="true">🔒</div>
        <h1 className="font-cinzel text-arcane-gold text-2xl font-bold">Location Locked</h1>
        <p className="text-parchment-light/60 text-sm font-inter text-center max-w-sm">
          {location.unlockRequirement
            ? `Complete ${location.unlockRequirement.requiredCompletedQuests} cases in the previous location to unlock ${location.name}.`
            : 'This location is not yet available.'}
        </p>
        <Link href="/play">
          <MagicalButton variant="gold">← Back to Map</MagicalButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-dark">
      {/* Header */}
      <header className="border-b border-border-gold/20 px-4 py-3 flex items-center gap-3 bg-parchment-dark/90 sticky top-0 z-10">
        <Link href="/play">
          <MagicalButton variant="gold" size="sm">← Map</MagicalButton>
        </Link>
        <h1 className="font-cinzel text-parchment-light/80 text-sm">
          {location.name}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <StreetView location={location} completedQuestIds={completedQuestIds} />
      </main>
    </div>
  );
}
