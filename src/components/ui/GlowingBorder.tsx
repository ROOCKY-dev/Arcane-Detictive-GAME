'use client';

import { HTMLAttributes } from 'react';

interface GlowingBorderProps extends HTMLAttributes<HTMLDivElement> {
  color?: 'gold' | 'blue' | 'green' | 'purple';
  active?: boolean;
}

const glowClasses: Record<string, string> = {
  gold: 'border-arcane-gold shadow-arcane-gold',
  blue: 'border-arcane-blue shadow-arcane-blue',
  green: 'border-arcane-green shadow-arcane-green',
  purple: 'border-arcane-purple shadow-arcane-purple',
};

export function GlowingBorder({
  children,
  color = 'gold',
  active = false,
  className = '',
  ...props
}: GlowingBorderProps) {
  return (
    <div
      className={[
        'border-2 rounded transition-all duration-300',
        glowClasses[color],
        active ? 'shadow-lg' : 'shadow-none border-opacity-40',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
