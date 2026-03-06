/**
 * Archmage Tower layout — sidebar + header shell for the teacher dashboard.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { href: '/archmage-tower/apprentices', label: 'My Apprentices', icon: '📜' },
  { href: '/archmage-tower/forge', label: 'Forge a Quest', icon: '⚒️' },
];

export default function ArchmageTowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-parchment-dark text-parchment-light flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border-gold/20 flex flex-col">
        {/* Tower branding */}
        <div className="px-4 py-5 border-b border-border-gold/20">
          <p className="font-cinzel text-arcane-gold font-bold text-sm tracking-wide">
            🏰 Archmage Tower
          </p>
          {user && (
            <p className="text-parchment-light/40 text-xs font-inter mt-0.5 truncate">
              {user.username}
            </p>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-2.5 px-3 py-2 rounded text-sm font-inter transition-colors',
                  active
                    ? 'bg-arcane-gold/15 text-arcane-gold border border-arcane-gold/30'
                    : 'text-parchment-light/50 hover:text-parchment-light hover:bg-parchment/5',
                ].join(' ')}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Back to game */}
        <div className="px-3 py-4 border-t border-border-gold/20">
          <Link
            href="/play"
            className="flex items-center gap-2 px-3 py-2 rounded text-xs font-inter text-parchment-light/30 hover:text-parchment-light/60 transition-colors"
          >
            ← Return to Realm
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="border-b border-border-gold/20 px-6 py-3 flex items-center justify-between">
          <h1 className="font-cinzel text-parchment-light/80 text-sm font-semibold tracking-wide">
            {NAV.find((n) => pathname.startsWith(n.href))?.label ?? 'Dashboard'}
          </h1>
          <span className="text-parchment-light/30 text-xs font-inter">
            Realm of Syntaxia — Instructor View
          </span>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
