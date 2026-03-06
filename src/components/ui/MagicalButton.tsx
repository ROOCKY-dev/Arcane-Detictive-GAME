'use client';

import { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface MagicalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'blue' | 'green' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantClasses: Record<string, string> = {
  gold: 'border-arcane-gold text-arcane-gold hover:bg-arcane-gold/10 shadow-arcane-gold/30',
  blue: 'border-arcane-blue text-arcane-blue hover:bg-arcane-blue/10 shadow-arcane-blue/30',
  green: 'border-arcane-green text-arcane-green hover:bg-arcane-green/10 shadow-arcane-green/30',
  purple: 'border-arcane-purple text-arcane-purple hover:bg-arcane-purple/10 shadow-arcane-purple/30',
  red: 'border-arcane-red text-arcane-red hover:bg-arcane-red/10 shadow-arcane-red/30',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export function MagicalButton({
  children,
  variant = 'gold',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: MagicalButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.03 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      disabled={isDisabled}
      className={[
        'relative inline-flex items-center justify-center gap-2',
        'font-cinzel font-semibold tracking-wide',
        'border-2 rounded',
        'transition-all duration-200',
        'shadow-sm hover:shadow-md',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {isLoading && (
        <span className="animate-spin text-sm" aria-hidden="true">✨</span>
      )}
      {children}
    </motion.button>
  );
}
