import { redirect } from 'next/navigation';

/** Root of /archmage-tower — redirect to the apprentices roster. */
export default function ArchmageTowerRoot() {
  redirect('/archmage-tower/apprentices');
}
