'use client';

import { HTMLAttributes } from 'react';

interface ParchmentPanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  titleIcon?: string;
}

export function ParchmentPanel({
  children,
  title,
  titleIcon,
  className = '',
  ...props
}: ParchmentPanelProps) {
  return (
    <div
      className={[
        'bg-parchment-dark border border-border-gold/40 rounded',
        'shadow-[inset_0_1px_0_rgba(201,160,78,0.15)]',
        className,
      ].join(' ')}
      {...props}
    >
      {title && (
        <div className="border-b border-border-gold/30 px-4 py-2.5 flex items-center gap-2">
          {titleIcon && <span aria-hidden="true">{titleIcon}</span>}
          <h3 className="font-cinzel text-parchment-light text-sm font-semibold tracking-wide">
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
