'use client';

import { useParams, notFound } from 'next/navigation';
import { InteriorView } from '@/components/game/InteriorView';
import { useGameState } from '@/hooks/useGameState';
import { getBuilding } from '@/data/locations';
import { getQuestsForLocation } from '@/lib/game-data';
import Link from 'next/link';
import { MagicalButton } from '@/components/ui/MagicalButton';

export default function InteriorPage() {
  const params = useParams<{ locationId: string; buildingId: string }>();
  const { locationId, buildingId } = params;
  const { completedQuestIds } = useGameState();

  let building;
  try {
    building = getBuilding(locationId, buildingId);
  } catch {
    notFound();
  }

  // Find the next available quest in this building
  const allLocationQuests = getQuestsForLocation(locationId);
  const buildingQuests = allLocationQuests.filter((q) => q.buildingId === buildingId);

  const currentQuest =
    buildingQuests.find(
      (q) =>
        !completedQuestIds.includes(q.id) &&
        q.prerequisiteQuestIds.every((id) => completedQuestIds.includes(id))
    ) ?? buildingQuests[buildingQuests.length - 1];

  if (!currentQuest) {
    return (
      <div className="min-h-screen bg-parchment-dark flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl" aria-hidden="true">📜</div>
        <h2 className="font-cinzel text-arcane-gold text-xl font-bold">All Cases Resolved</h2>
        <p className="text-parchment-light/60 text-sm font-inter">
          No active cases in {building.name}. Well done, Inquisitor!
        </p>
        <Link href={`/play/${locationId}`}>
          <MagicalButton variant="gold">← Back to {locationId}</MagicalButton>
        </Link>
      </div>
    );
  }

  return <InteriorView quest={currentQuest} locationId={locationId} />;
}
