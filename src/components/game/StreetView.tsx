'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Location, Building } from '@/types/game';

interface StreetViewProps {
  location: Location;
  completedQuestIds: string[];
}

export function StreetView({ location, completedQuestIds }: StreetViewProps) {
  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div
        className="relative w-full h-40 sm:h-52 rounded-lg overflow-hidden flex items-end"
        style={
          location.imageUrl
            ? { backgroundImage: `url(${location.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
            : undefined
        }
      >
        {/* Gradient overlay — always present; darker when no image */}
        <div
          className={[
            'absolute inset-0',
            location.imageUrl
              ? 'bg-gradient-to-t from-parchment-dark via-black/40 to-transparent'
              : 'bg-parchment-dark/80',
          ].join(' ')}
          aria-hidden="true"
        />

        {/* Text anchored to bottom of hero */}
        <div className="relative px-5 pb-4 w-full">
          <div className="flex items-end gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              {location.iconEmoji}
            </span>
            <div>
              <h2 className="font-cinzel text-arcane-gold text-xl font-bold leading-tight">
                {location.name}
              </h2>
              <p className="text-parchment-light/70 text-xs font-inter">
                {location.vibe}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buildings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {location.buildings.map((building, idx) => {
          const questsCompleted = building.questIds.filter((id) =>
            completedQuestIds.includes(id)
          ).length;
          const total = building.questIds.length;
          const isLocked = building.isLocked;

          return (
            <motion.div
              key={building.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {isLocked ? (
                <BuildingCard
                  building={building}
                  questsCompleted={questsCompleted}
                  total={total}
                  isLocked
                />
              ) : (
                <Link
                  href={`/play/${location.id}/${building.id}`}
                  className="block group"
                >
                  <BuildingCard
                    building={building}
                    questsCompleted={questsCompleted}
                    total={total}
                    isLocked={false}
                  />
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface BuildingCardProps {
  building: Building;
  questsCompleted: number;
  total: number;
  isLocked: boolean;
}

function BuildingCard({
  building,
  questsCompleted,
  total,
  isLocked,
}: BuildingCardProps) {
  return (
    <div
      className={[
        'rounded-lg border-2 p-5 h-full transition-all duration-200',
        isLocked
          ? 'border-parchment/15 bg-parchment-dark/40 opacity-50 cursor-not-allowed'
          : 'border-border-gold/40 bg-parchment-dark hover:border-arcane-gold hover:shadow-arcane-gold cursor-pointer group-hover:bg-parchment/5',
      ].join(' ')}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xl shrink-0" aria-hidden="true">
          {isLocked ? '🔒' : '🏛️'}
        </span>
        <div>
          <h3 className="font-cinzel text-parchment-light text-sm font-bold leading-tight">
            {building.name}
          </h3>
          {total > 0 && !isLocked && (
            <span className="text-xs text-parchment-light/40 font-inter">
              {questsCompleted}/{total} cases
            </span>
          )}
        </div>
      </div>
      <p className="text-parchment-light/55 text-xs font-inter leading-relaxed">
        {building.description}
      </p>
    </div>
  );
}
