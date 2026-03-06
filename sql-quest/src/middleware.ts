/**
 * Route protection middleware.
 * Guards /archmage-tower — only users with role 'teacher' may enter.
 * If Supabase is not configured, the guard is skipped (dev/guest mode).
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isSupabaseReady =
  Boolean(supabaseUrl) &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'your-anon-key-here';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Skip guard when Supabase is not configured
  if (!isSupabaseReady) return res;

  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/?error=login_required', req.url));
  }

  // Fetch the user's role from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'teacher') {
    return NextResponse.redirect(new URL('/?error=teacher_only', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/archmage-tower/:path*'],
};
