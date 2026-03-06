'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Location, LocationProgress } from '@/types/game';
import { NoticeBoardModal } from './NoticeBoardModal';

interface WorldMapProps {
  locations: Location[];
  locationProgress: Record<string, LocationProgress>;
  unlockedLocationIds: string[];
}

export function WorldMap({
  locations,
  locationProgress,
  unlockedLocationIds,
}: WorldMapProps) {
  const [noticeBoardOpen, setNoticeBoardOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {locations.map((location, idx) => {
        const isUnlocked = unlockedLocationIds.includes(location.id);
        const progress = locationProgress[location.id];
        const completed = progress?.questsCompleted ?? 0;
        const total = progress?.totalQuests ?? 0;

        return (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {isUnlocked ? (
              <Link href={`/play/${location.id}`} className="block group">
                <LocationCard
                  location={location}
                  completed={completed}
                  total={total}
                  isUnlocked
                />
              </Link>
            ) : (
              <LocationCard
                location={location}
                completed={0}
                total={total}
                isUnlocked={false}
                unlockInfo={location.unlockRequirement}
              />
            )}
          </motion.div>
        );
      })}
      </div>

      {/* Notice Board */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => setNoticeBoardOpen(true)}
          className="w-full flex items-center justify-center gap-3 border border-dashed border-border-gold/30 rounded-lg py-3 px-4 text-parchment-light/40 hover:text-parchment-light/70 hover:border-border-gold/60 transition-all group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform" aria-hidden="true">📋</span>
          <span className="font-cinzel text-xs tracking-wide">Notice Board — Enter a Quest Code</span>
        </button>
      </div>

      <NoticeBoardModal
        isOpen={noticeBoardOpen}
        onClose={() => setNoticeBoardOpen(false)}
      />
    </>
  );
}

interface LocationCardProps {
  location: Location;
  completed: number;
  total: number;
  isUnlocked: boolean;
  unlockInfo?: Location['unlockRequirement'];
}

function LocationCard({
  location,
  completed,
  total,
  isUnlocked,
  unlockInfo,
}: LocationCardProps) {
  const hasBg = Boolean(location.imageUrl);

  return (
    <div
      className={[
        'relative rounded-lg border-2 overflow-hidden transition-all duration-200',
        isUnlocked
          ? 'border-border-gold/50 hover:border-arcane-gold hover:shadow-arcane-gold cursor-pointer'
          : 'border-parchment/20 opacity-60 cursor-not-allowed',
      ].join(' ')}
      style={
        hasBg
          ? { backgroundImage: `url(${location.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
          : undefined
      }
    >
      {/* Dark overlay for legibility */}
      <div
        className={[
          'absolute inset-0',
          hasBg ? 'bg-black/55' : isUnlocked ? 'bg-parchment-dark' : 'bg-parchment-dark/50',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* Content sits above overlay */}
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl" aria-hidden="true">
            {isUnlocked ? location.iconEmoji : '🔒'}
          </div>
          {isUnlocked && total > 0 && (
            <span className="text-xs font-inter text-parchment-light/70 bg-black/40 px-2 py-0.5 rounded">
              {completed}/{total}
            </span>
          )}
        </div>

        <h3 className="font-cinzel text-parchment-light font-bold text-sm mb-1">
          {location.name}
        </h3>
        <p className="text-parchment-light/70 text-xs font-inter leading-relaxed line-clamp-2 mb-3">
          {location.description}
        </p>

        {isUnlocked ? (
          total > 0 && (
            <div className="w-full bg-black/30 rounded-full h-1.5">
              <div
                className="bg-arcane-gold h-1.5 rounded-full transition-all"
                style={{ width: `${(completed / total) * 100}%` }}
                role="progressbar"
                aria-valuenow={completed}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`${completed} of ${total} cases solved`}
              />
            </div>
          )
        ) : (
          <p className="text-parchment-light/50 text-xs font-inter italic">
            {unlockInfo
              ? `Complete ${unlockInfo.requiredCompletedQuests} cases in the previous location to unlock`
              : 'Locked'}
          </p>
        )}
      </div>
    </div>
  );
}
