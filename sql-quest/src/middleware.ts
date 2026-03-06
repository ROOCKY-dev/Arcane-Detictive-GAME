/**
 * Route protection middleware.
 * Guards /archmage-tower — only users with role 'teacher' may enter.
 * If Supabase is not configured, the guard is skipped (dev/guest mode).
 */

import { createServerClient } from '@supabase/auth-helpers-nextjs';
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

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return req.cookies.get(name)?.value;
      },
      set(name, value, options) {
        req.cookies.set({ name, value, ...options });
        res.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        req.cookies.set({ name, value: '', ...options });
        res.cookies.set({ name, value: '', ...options });
      },
    },
  });

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

  const profileRow = profile as { role: string } | null;
  if (!profileRow || profileRow.role !== 'teacher') {
    return NextResponse.redirect(new URL('/?error=teacher_only', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/archmage-tower/:path*'],
};
