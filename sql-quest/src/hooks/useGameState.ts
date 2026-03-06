/**
 * useGameState — Zustand store for all game progress.
 * Persists to localStorage automatically. Works without auth (guest mode).
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestProgress, Achievement } from '@/types/game';
import { LOCATIONS } from '@/data/locations';
import { getQuestsForLocation, getQuest } from '@/lib/game-data';
import { ACHIEVEMENTS } from '@/lib/achievements';
import {
  syncQuestProgressToCloud,
  syncAchievementToCloud,
  loadQuestProgressFromCloud,
} from '@/lib/supabase';

interface GameStateStore {
  completedQuestIds: string[];
  questProgress: Record<string, QuestProgress>;
  unlockedLocationIds: string[];
  earnedAchievementIds: string[];
  currentLocationId: string | null;
  currentQuestId: string | null;
  /** Supabase user ID when authenticated; null in guest mode. */
  cloudSyncUserId: string | null;

  completeQuest: (
    questId: string,
    data: { hintsUsed: number; timeSeconds: number; lastQuery: string }
  ) => void;
  useHint: (questId: string) => void;
  setCurrentLocation: (locationId: string | null) => void;
  setCurrentQuest: (questId: string | null) => void;
  getQuestProgress: (questId: string) => QuestProgress | null;
  earnAchievement: (achievementId: string) => void;
  resetAllProgress: () => void;
  /** Call on login: sets the cloud user and merges remote progress locally. */
  loadFromSupabase: (userId: string) => Promise<void>;
  /** Clears the cloud user reference (on logout). */
  clearCloudUser: () => void;
}

const INITIAL_UNLOCKED = ['archives'];

function buildInitialProgress(questId: string): QuestProgress {
  return {
    questId,
    completed: false,
    hintsUsed: 0,
    attempts: 0,
    completedAt: null,
    timeSpentSeconds: 0,
    lastQuery: '',
  };
}

function checkAndGrantAchievements(
  completedIds: string[],
  questProgress: Record<string, QuestProgress>,
  earnedIds: string[],
  earnFn: (id: string) => void
) {
  for (const achievement of ACHIEVEMENTS) {
    if (earnedIds.includes(achievement.id)) continue;
    if (isAchievementEarned(achievement, completedIds, questProgress)) {
      earnFn(achievement.id);
    }
  }
}

function isAchievementEarned(
  achievement: Achievement,
  completedIds: string[],
  questProgress: Record<string, QuestProgress>
): boolean {
  const { condition } = achievement;
  switch (condition.type) {
    case 'first_quest':
      return completedIds.length >= 1;
    case 'complete_location': {
      const quests = getQuestsForLocation(condition.locationId);
      return quests.every((q) => completedIds.includes(q.id));
    }
    case 'complete_all_quests': {
      const allIds = LOCATIONS.flatMap((loc) =>
        getQuestsForLocation(loc.id).map((q) => q.id)
      );
      return allIds.every((id) => completedIds.includes(id));
    }
    case 'solve_fast':
      return Object.values(questProgress).some(
        (p) => p.completed && p.timeSpentSeconds <= condition.seconds
      );
    case 'no_hints_location': {
      const quests = getQuestsForLocation(condition.locationId);
      return (
        quests.every((q) => completedIds.includes(q.id)) &&
        quests.every((q) => (questProgress[q.id]?.hintsUsed ?? 0) === 0)
      );
    }
    default:
      return false;
  }
}

export const useGameState = create<GameStateStore>()(
  persist(
    (set, get) => ({
      completedQuestIds: [],
      questProgress: {},
      unlockedLocationIds: INITIAL_UNLOCKED,
      earnedAchievementIds: [],
      currentLocationId: null,
      currentQuestId: null,
      cloudSyncUserId: null,

      completeQuest(questId, { hintsUsed, timeSeconds, lastQuery }) {
        set((state) => {
          const isNew = !state.completedQuestIds.includes(questId);
          const newCompletedIds = isNew
            ? [...state.completedQuestIds, questId]
            : state.completedQuestIds;

          const newProgress: QuestProgress = {
            questId,
            completed: true,
            hintsUsed,
            attempts: (state.questProgress[questId]?.attempts ?? 0) + 1,
            completedAt: Date.now(),
            timeSpentSeconds: timeSeconds,
            lastQuery,
          };

          // Check which locations should now be unlocked
          const newUnlocked = new Set(state.unlockedLocationIds);
          for (const location of LOCATIONS) {
            if (newUnlocked.has(location.id)) continue;
            if (!location.unlockRequirement) continue;
            const { locationId: reqLocId, requiredCompletedQuests } =
              location.unlockRequirement;
            const questsInReqLoc = getQuestsForLocation(reqLocId).map((q) => q.id);
            const completedInReqLoc = newCompletedIds.filter((id) =>
              questsInReqLoc.includes(id)
            ).length;
            if (completedInReqLoc >= requiredCompletedQuests) {
              newUnlocked.add(location.id);
            }
          }

          return {
            completedQuestIds: newCompletedIds,
            questProgress: { ...state.questProgress, [questId]: newProgress },
            unlockedLocationIds: Array.from(newUnlocked),
          };
        });

        // Check achievements after state is updated
        const state = get();
        checkAndGrantAchievements(
          state.completedQuestIds,
          state.questProgress,
          state.earnedAchievementIds,
          get().earnAchievement
        );

        // Fire-and-forget cloud sync if authenticated
        const { cloudSyncUserId, questProgress } = get();
        if (cloudSyncUserId) {
          const p = questProgress[questId];
          if (p) {
            const locationId = (() => {
              try { return getQuest(questId).locationId; } catch { return ''; }
            })();
            void syncQuestProgressToCloud(cloudSyncUserId, {
              questId: p.questId,
              locationId,
              completed: p.completed,
              hintsUsed: p.hintsUsed,
              attempts: p.attempts,
              timeSeconds: p.timeSpentSeconds,
              lastQuery: p.lastQuery,
              completedAt: p.completedAt,
            });
          }
          // Sync any newly earned achievements
          for (const achId of get().earnedAchievementIds) {
            void syncAchievementToCloud(cloudSyncUserId, achId);
          }
        }
      },

      useHint(questId) {
        set((state) => {
          const existing =
            state.questProgress[questId] ?? buildInitialProgress(questId);
          return {
            questProgress: {
              ...state.questProgress,
              [questId]: { ...existing, hintsUsed: existing.hintsUsed + 1 },
            },
          };
        });
      },

      setCurrentLocation(locationId) {
        set({ currentLocationId: locationId });
      },

      setCurrentQuest(questId) {
        set({ currentQuestId: questId });
      },

      getQuestProgress(questId) {
        return get().questProgress[questId] ?? null;
      },

      earnAchievement(achievementId) {
        set((state) => {
          if (state.earnedAchievementIds.includes(achievementId)) return state;
          return {
            earnedAchievementIds: [...state.earnedAchievementIds, achievementId],
          };
        });
      },

      async loadFromSupabase(userId) {
        set({ cloudSyncUserId: userId });

        const cloudRows = await loadQuestProgressFromCloud(userId);
        if (cloudRows.length === 0) return;

        set((state) => {
          const mergedProgress = { ...state.questProgress };
          const mergedCompleted = new Set(state.completedQuestIds);
          const newUnlocked = new Set(state.unlockedLocationIds);

          for (const row of cloudRows) {
            const existing = mergedProgress[row.questId];
            // Merge: prefer the more complete record (completed > not, then more attempts)
            if (!existing || row.completed || row.attempts > existing.attempts) {
              mergedProgress[row.questId] = {
                questId: row.questId,
                completed: row.completed,
                hintsUsed: row.hintsUsed,
                attempts: row.attempts,
                completedAt: row.completedAt,
                timeSpentSeconds: row.timeSeconds,
                lastQuery: row.lastQuery,
              };
            }
            if (row.completed) {
              mergedCompleted.add(row.questId);
            }
          }

          // Recompute unlocked locations from merged completions
          const mergedCompletedArr = Array.from(mergedCompleted);
          for (const location of LOCATIONS) {
            if (newUnlocked.has(location.id)) continue;
            if (!location.unlockRequirement) continue;
            const { locationId: reqLocId, requiredCompletedQuests } =
              location.unlockRequirement;
            const questsInReqLoc = getQuestsForLocation(reqLocId).map((q) => q.id);
            const completedCount = mergedCompletedArr.filter((id) =>
              questsInReqLoc.includes(id)
            ).length;
            if (completedCount >= requiredCompletedQuests) {
              newUnlocked.add(location.id);
            }
          }

          return {
            questProgress: mergedProgress,
            completedQuestIds: mergedCompletedArr,
            unlockedLocationIds: Array.from(newUnlocked),
          };
        });

        // Re-check achievements against merged state
        const state = get();
        checkAndGrantAchievements(
          state.completedQuestIds,
          state.questProgress,
          state.earnedAchievementIds,
          get().earnAchievement
        );
      },

      clearCloudUser() {
        set({ cloudSyncUserId: null });
      },

      resetAllProgress() {
        set({
          completedQuestIds: [],
          questProgress: {},
          unlockedLocationIds: INITIAL_UNLOCKED,
          earnedAchievementIds: [],
          currentLocationId: null,
          currentQuestId: null,
          cloudSyncUserId: null,
        });
      },
    }),
    {
      name: 'sql-quest-progress',
      version: 1,
    }
  )
);
