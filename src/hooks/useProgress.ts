/**
 * useProgress — progress-specific logic built on top of useGameState.
 */

'use client';

import { useMemo } from 'react';
import { useGameState } from './useGameState';
import { LOCATIONS } from '@/data/locations';
import { getQuestsForLocation } from '@/lib/game-data';
import type { LocationProgress, PlayerProgress } from '@/types/game';

/** Calculates per-location progress and overall player stats */
export function useProgress(): PlayerProgress & {
  locationProgress: Record<string, LocationProgress>;
} {
  const { completedQuestIds, questProgress, unlockedLocationIds, earnedAchievementIds } =
    useGameState();

  return useMemo(() => {
    const locationProgress: Record<string, LocationProgress> = {};

    for (const location of LOCATIONS) {
      const quests = getQuestsForLocation(location.id);
      const completedInLocation = quests.filter((q) =>
        completedQuestIds.includes(q.id)
      ).length;

      locationProgress[location.id] = {
        locationId: location.id,
        questsCompleted: completedInLocation,
        totalQuests: quests.length,
        isUnlocked: unlockedLocationIds.includes(location.id),
        isCompleted: completedInLocation === quests.length && quests.length > 0,
      };
    }

    const totalHintsUsed = Object.values(questProgress).reduce(
      (sum, p) => sum + p.hintsUsed,
      0
    );
    const totalAttempts = Object.values(questProgress).reduce(
      (sum, p) => sum + p.attempts,
      0
    );

    return {
      totalQuestsCompleted: completedQuestIds.length,
      totalHintsUsed,
      totalAttempts,
      achievementsEarned: earnedAchievementIds,
      locationProgress,
    };
  }, [completedQuestIds, questProgress, unlockedLocationIds, earnedAchievementIds]);
}
