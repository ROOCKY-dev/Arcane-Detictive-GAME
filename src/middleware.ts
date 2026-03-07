/**
 * Route protection middleware.
 * Guards /archmage-tower — only users with role 'teacher' may enter.
 * If Supabase is not configured, the guard is skipped (dev/guest mode).
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Anon key is public (protected by RLS). Hardcoded fallback ensures the
// middleware runs correctly in production even without Vercel env vars set.
const supabaseUrl =
  (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim() ||
  'https://eyfcxhhcowkeqgqtsuel.supabase.co';
const supabaseAnonKey =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZmN4aGhjb3drZXFncXRzdWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDY0NzksImV4cCI6MjA4ODM4MjQ3OX0.' +
  'U1eH9OLAJ7zvzpt69ys_Y3y4p54JX7L2JVZf4svVFXs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('reason', 'login_required');
    return NextResponse.redirect(url);
  }

  // Fetch the user's role from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const profileRow = profile as { role: string } | null;
  if (!profileRow || profileRow.role !== 'teacher') {
    const url = req.nextUrl.clone();
    url.pathname = '/play';
    url.searchParams.set('reason', 'teacher_only');
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/archmage-tower/:path*'],
};
