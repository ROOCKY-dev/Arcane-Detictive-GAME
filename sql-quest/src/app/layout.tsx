import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SQL Quest: The Realm of Syntaxia',
  description:
    'Learn SQL by solving medieval mysteries! Cast spells with SQL queries, solve magical crimes, and become a Master Inquisitor of the Ledger.',
  keywords: ['SQL', 'learning', 'game', 'education', 'medieval', 'fantasy'],
  openGraph: {
    title: 'SQL Quest: The Realm of Syntaxia',
    description: 'An educational SQL mystery game for college students',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-parchment-dark text-parchment-light">
        {children}
      </body>
    </html>
  );
}
