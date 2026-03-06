'use client';

import Link from 'next/link';
import { MagicalButton } from '@/components/ui/MagicalButton';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-parchment-dark flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-4xl" aria-hidden="true">🔑</div>
      <h1 className="font-cinzel text-arcane-gold text-2xl font-bold">Login to the Guild Registry</h1>
      <p className="text-parchment-light/50 text-sm font-inter text-center max-w-sm">
        Authentication coming soon! For now, play as a guest — your progress is saved locally.
      </p>
      <div className="flex gap-3">
        <Link href="/play">
          <MagicalButton variant="gold">Play as Guest</MagicalButton>
        </Link>
        <Link href="/">
          <MagicalButton variant="blue">← Home</MagicalButton>
        </Link>
      </div>
    </div>
  );
}
