import { redirect } from 'next/navigation';

/** Register is handled in the unified /auth/login page (Sign In / Register tabs). */
export default function RegisterPage() {
  redirect('/auth/login');
}
